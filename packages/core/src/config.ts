import type { /* Arrayable, */ SetRequiredDeep } from 'type-fest'
import process from 'node:process'
import { loadConfig as _loadConfig } from 'c12'
import { defu } from 'defu'

export async function loadConfig<T extends Config = Config>(
  ...configs: T[]
): Promise<ResolvedConfig> {
  const { config } = await _loadConfig({
    name: 'wocat',
  })

  const resolvedConfig = resolveConfig(...configs, config)

  return resolvedConfig
}

export const defaultConfig: Config = {
  patterns: [],
  // TODO: add more features
  // interactive: false,
  min: '1',
  // all: false,
}

export function resolveConfig(...configs: Config[]): ResolvedConfig {
  configs.push(defaultConfig)
  const config = defu<Config, Config[]>(configs.unshift(), ...configs)

  config.cwd ??= process.cwd()
  config.patterns = Array.from(new Set(config.patterns)).filter(Boolean)

  return {
    ...config,
    resolved: true,
  } as ResolvedConfig
}

export interface Config {
  /**
   * the patterns to match files
   *
   * powered by [tinyglobby](https://github.com/SuperchupuDev/tinyglobby#readme)
   *
   * 匹配文件的 glob 模式
   *
   * @default []
   */
  patterns?: string[]
  /**
   * work directory
   *
   * 工作目录
   *
   * @default process.cwd()
   */
  cwd?: string
  // TODO: add more features
  // /**
  //  * whether to run in interactive mode
  //  *
  //  * 是否运行在交互模式
  //  *
  //  * @default false
  //  */
  // interactive?: boolean
  /**
   * Only select dependencies greater than or equal to the specified count
   *
   * 只选择超过特定数量的依赖
   *
   * @default '1'
   */
  min?: string
  // /**
  //  * Select all dependencies, even if they are already cataloged
  //  *
  //  * 选择所有依赖，即使它们已经被编目
  //  *
  //  * @default false
  //  */
  // all?: boolean
}

export interface ResolvedConfig extends SetRequiredDeep<
  Config,
  | 'patterns'
  | 'cwd'
  // TODO: add more features
  // | 'interactive'
  | 'min'
  // | 'all'
> {
  /**
   * whether the config has been resolved
   *
   * 配置是否已经被解析
   */
  resolved: true
}
