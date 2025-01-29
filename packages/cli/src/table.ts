import { stripAnsi } from 'consola/utils'

type Alignment = 'left' | 'right' | 'center'

interface ColumnConfig {
  align?: Alignment
  gap?: number
}

interface FormatOptions {
  columns?: Record<string, ColumnConfig>
  defaultGap?: number
  defaultAlign?: Alignment
}

function alignText(text: string, width: number, align: Alignment = 'left'): string {
  const spaces = width - stripAnsi(text).length
  if (spaces <= 0) {
    return text
  }

  switch (align) {
    case 'right':
      return ' '.repeat(spaces) + text
    case 'center':
    {
      const leftSpaces = Math.floor(spaces / 2)
      const rightSpaces = spaces - leftSpaces
      return ' '.repeat(leftSpaces) + text + ' '.repeat(rightSpaces)
    }
    default:
      return text + ' '.repeat(spaces)
  }
}

function calculateColumnWidth(values: (string | string[])[]): number {
  return Math.max(...values.flatMap(v =>
    Array.isArray(v) ? v.map(item => stripAnsi(item).length) : [stripAnsi(v).length],
  ))
}

export function formatToTable(dataArray: Record<string, string | string[]>[], options: FormatOptions = {}): string[] {
  const {
    columns = {},
    defaultGap = 2,
    defaultAlign = 'left',
  } = options

  const allKeys = Array.from(new Set(dataArray.flatMap(data => Object.keys(data))))

  const columnConfigs = allKeys.map((key) => {
    const config = columns[key]
    const allValues = dataArray.map(data => data[key]).filter(Boolean) as (string | string[])[]
    return {
      key,
      width: calculateColumnWidth(allValues),
      gap: config?.gap ?? defaultGap,
      align: config?.align || defaultAlign,
    }
  })

  return dataArray.map((data) => {
    const formattedColumns: string[][] = []

    columnConfigs.forEach(({ key, width, align }, columnIndex) => {
      const value = data[key]
      if (Array.isArray(value)) {
        formattedColumns[columnIndex] = value.map(item =>
          alignText(String(item), width, align),
        )
      }
      else if (value) {
        formattedColumns[columnIndex] = [alignText(String(value), width, align)]
      }
      else {
        formattedColumns[columnIndex] = ['']
      }
    })

    const maxRows = Math.max(...formattedColumns.map(col => col.length || 1))

    const rows: string[] = []
    for (let i = 0; i < maxRows; i++) {
      const row = formattedColumns.map((col, colIndex) => {
        const value = col[i] || ' '.repeat(columnConfigs[colIndex]!.width)
        const gap = colIndex < columnConfigs.length - 1
          ? ' '.repeat(columnConfigs[colIndex]!.gap)
          : ''
        return value + gap
      })
      rows.push(row.join(''))
    }

    // TODO why consola.prompt label need something in the front of the string?
    return rows.join('\n..')
  })
}
