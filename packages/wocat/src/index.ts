import type { Config } from '@wocat/core'

export * from '@wocat/cli'
export * from '@wocat/core'

export function defineConfig(config: Config): Config {
  return config
}
