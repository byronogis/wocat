import type { Config, ResolvedConfig } from '@wocat/core'

interface BaseCLIConfig {
  /**
   * Watch mode
   * @default false
   */
  watch?: boolean
}

export type CliConfig = BaseCLIConfig & Config

export type ResolvedCliConfig = BaseCLIConfig & ResolvedConfig
