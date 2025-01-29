import type { Config, ResolvedConfig } from '@wocat/core'

interface BaseCLIConfig {
  /**
   * whether to run in interactive mode
   *
   * 是否运行在交互模式
   *
   * @default false
   */
  interactive?: boolean
  /**
   * Watch mode
   * @default false
   */
  watch?: boolean
}

export type CliConfig = BaseCLIConfig & Config

export type ResolvedCliConfig = BaseCLIConfig & ResolvedConfig
