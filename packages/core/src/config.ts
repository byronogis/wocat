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
}

export interface ResolvedConfig extends SetRequiredDeep<
  Config,
  | 'patterns'
  | 'cwd'
> {
  /**
   * whether the config has been resolved
   *
   * 配置是否已经被解析
   */
  resolved: true
}
