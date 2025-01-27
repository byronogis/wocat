import type { PackageJson } from 'type-fest'
import type { Document } from 'yaml'

export type FileType = 'json' | 'yaml'

export interface FileItem<T extends FileType = 'json'> {
  /**
   * file path
   */
  id: string
  /**
   * file content
   */
  content: string
  type: T
}

export interface ParsedYAMLFile extends FileItem<'yaml'> {
  parsedContent: Document
}

export interface ParsedJSONFile extends FileItem {
  parsedContent: PackageJson
}

export interface DepItem {
  /**
   * name:value
   */
  id: string
  name: string
  value: string
  scoped: Array<{
    file: FileItem['id']
    name: NonNullable<PackageJson['name']>
    type: 'dependencies' | 'devDependencies'
  }>
  selected: boolean
  catalog: string | 'default'
}
