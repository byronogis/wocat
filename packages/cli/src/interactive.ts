import type { CoreContext } from '@wocat/core'
import { cyan, dim, green, yellow } from 'colorette'
import { consola } from 'consola'
import { formatToTable } from './table'

export async function runInteractive(ctx: CoreContext): Promise<void> {
  const data = ctx.deps.values().reduce((acc, dep) => {
    const scopedFlat = dep.scoped.reduce((acc, { name, type }) => {
      acc.scoped_names.push(green(name))
      acc.scoped_types.push(dim(type))

      return acc
    }, {
      scoped_names: [],
      scoped_types: [],
    } as Record<'scoped_names' | 'scoped_types', string[]>)

    acc.push({
      id: dep.id,
      labels: {
        name: cyan(dep.name),
        value: dep.value,
        catalog: yellow(dep.catalog),
        ...scopedFlat,
      },
    })

    return acc
  }, [] as { id: string, labels: any }[])

  const labelsList = data.reduce((acc, { labels }) => {
    acc.push(labels)
    return acc
  }, [] as any[])

  const formatedLabelsList = formatToTable(labelsList, {
    columns: {
      scoped_types: {
        align: 'right',
      },
    },
  })

  const res = await consola.prompt('Select dependencies to convert to catalogs', {
    type: 'multiselect',
    options: data.map(({ id }, index) => {
      return {
        value: id,
        label: formatedLabelsList[index]!,
      }
    }),
  }) as unknown as string[]

  res.forEach((value) => {
    ctx.deps.get(value)!.selected = true
  })
}
