import type { Hookable } from 'hookable'
import type { Arrayable, PackageJson } from 'type-fest'
import type { Config, ResolvedConfig } from './config'
import type { CoreOptions, CoreReturns } from './core'
import type { Hooks } from './hooks'
import type { DepItem, FileItem, ParsedJSONFile, ParsedYAMLFile } from './types'
import { parseJSON, stringifyJSON } from 'confbox'
import { groupBy } from 'es-toolkit'
import semver from 'semver'
import { parseDocument as parseYAML, stringify as stringifyYAML } from 'yaml'
import { resolveConfig } from './config'
import { CoreError } from './errors'
import { resolveHooks } from './hooks'

const CATALOG_DEFAULT = 'default'

export class CoreContext {
  config: ResolvedConfig
  hooks: Hookable<Hooks>
  #payload?: CoreOptions
  #deps: Map<DepItem['id'], DepItem> = new Map()
  #parsedConfigFile?: ParsedYAMLFile
  #parsedPackageFiles?: Map<FileItem['id'], ParsedJSONFile>

  constructor(options: ContextOptions) {
    const _configs = [options.configs].flat(2)
    // @ts-expect-error resolved poperty is not defined in Config but in ResolvedConfig
    this.config = _configs[0].resolved
      ? _configs[0] as ResolvedConfig
      : resolveConfig(..._configs)

    this.hooks = resolveHooks(this.config)
  }

  generateDepId({ value, name }: Pick<DepItem, 'value' | 'name'>): DepItem['id'] {
    return `${name}:${value}`
  }

  run(options: CoreOptions): CoreReturns {
    this.#payload = options
    this.#parsedConfigFile = {
      ...options.configFile,
      parsedContent: parseYAML(options.configFile.content),
    }
    this.#parsedPackageFiles = new Map(options.packageFiles.map((file) => {
      const parsedContent = parseJSON<PackageJson>(file.content)
      return [file.id, { ...file, parsedContent }]
    }))

    this.#generateDeps()

    this.#resolveCatalog()

    this.#updateParsedFiles()

    return {
      configFile: {
        ...this.#payload!.configFile,
        content: stringifyYAML(this.#parsedConfigFile!.parsedContent),
      },
      packageFiles: Array.from(this.#parsedPackageFiles!.values()).map((file) => {
        return {
          ...file,
          content: stringifyJSON(file.parsedContent),
        }
      }),
    }
  }

  /**
   * Generate dependency information from package files
   *
   * 从包文件中生成依赖信息
   */
  #generateDeps(): void {
    if (!(this.#parsedConfigFile && this.#parsedPackageFiles)) {
      throw new CoreError('[@wocat/core] Please call init() first')
    }

    this.#parsedPackageFiles.forEach(({ parsedContent: pkg, id }) => {
      if (!pkg.name) {
        throw new CoreError(`[@wocat/core] package.json must have a name field, check ${id}`)
      }

      Object.entries({
        dependencies: pkg.dependencies,
        devDependencies: pkg.devDependencies,
      }).forEach(([type, deps]) => {
        if (!deps) {
          return
        }

        Object.entries(deps).forEach(([name, value]) => {
          if (
            !value
            || !semver.valid(semver.coerce(value))
            || value.startsWith('file:')
            || value.startsWith('link:')
            || value.startsWith('catalog:')
          ) {
            return
          }

          const depId = this.generateDepId({ value, name })
          const isExsit = this.#deps?.has(depId)
          const scopedItem = {
            file: id,
            name: pkg.name!,
            type: type as DepItem['scoped'][number]['type'],
          }
          if (isExsit) {
            this.#deps.get(depId)!.scoped.push(scopedItem)
            return
          }

          this.#deps.set(depId, {
            id: depId,
            name,
            value,
            scoped: [scopedItem],
            selected: false,
            catalog: CATALOG_DEFAULT,
          })
        })
      })
    })

    /**
     * Remove dependencies that less than the specified count
     *
     * 移除小于指定数量的依赖
     */
    this.#deps.forEach((dep) => {
      if (dep.scoped.length < Number(this.config.min)) {
        this.#deps.delete(dep.id)
      }
    })
  }

  /**
   * Resolve [Catalog](https://pnpm.io/catalogs) information
   *
   * Select the latest version as the [Default Catalog](https://pnpm.io/catalogs#default-catalog),
   * other versions are put into [Named Catalogs](https://pnpm.io/catalogs#named-catalog) as `name:version`
   *
   * 处理 [Catalog](https://pnpm.io/catalogs) 信息
   *
   * 选取最新的版本作为 [Default Catalog](https://pnpm.io/catalogs#default-catalog),
   * 其他版本以 `名称:版本` 放入 [Named Catalogs](https://pnpm.io/catalogs#named-catalogs)
   */
  #resolveCatalog(): void {
    const depsByName = groupBy(Array.from(this.#deps.values()), i => i.name)
    Object.values(depsByName).filter(i => i.length > 1).forEach((_deps) => {
      const name = _deps[0]!.name

      const sortedVersions = _deps.map(j => [j.value, semver.coerce(j.value)!] as const)
        .sort((a, b) => semver.compare(a[1], b[1]))
        .map(j => j[0])

      sortedVersions.forEach((v) => {
        const _id = this.generateDepId({ value: v, name })!
        this.#deps.get(_id!)!.catalog = _id
      })
      this.#deps.get(this.generateDepId({ value: sortedVersions.at(-1)!, name }))!.catalog = CATALOG_DEFAULT
    })
  }

  /**
   * Update the parsed content of the configuration file and package files
   *
   * 更新配置文件和包文件的解析内容
   */
  #updateParsedFiles(): void {
    this.#deps.forEach((dep) => {
      if (dep.catalog === CATALOG_DEFAULT) {
        this.#parsedConfigFile!.parsedContent.setIn([`catalog`, `${dep.name}`], dep.value)
      }
      else {
        this.#parsedConfigFile!.parsedContent.setIn([`catalogs`, `${dep.catalog}`, `${dep.name}`], dep.value)
      }

      dep.scoped.forEach(({ file, type }) => {
        const pkg = this.#parsedPackageFiles!.get(file)!.parsedContent
        pkg[type]![dep.name]! = `catalog:${dep.catalog === CATALOG_DEFAULT ? '' : dep.catalog}`
      })
    })
  }
}

interface ContextOptions {
  configs: ResolvedConfig | Arrayable<Config>
}
