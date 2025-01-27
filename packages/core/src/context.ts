import type { Hookable } from 'hookable'
import type { Arrayable } from 'type-fest'
import type { Config, ResolvedConfig } from './config'
import type { Hooks } from './hooks'
import { resolveConfig } from './config'
import { resolveHooks } from './hooks'

export class CoreContext {
  config: ResolvedConfig
  hooks: Hookable<Hooks>

  constructor(options: ContextOptions) {
    const _configs = [options.configs].flat(2)
    // @ts-expect-error resolved poperty is not defined in Config but in ResolvedConfig
    this.config = _configs[0].resolved
      ? _configs[0] as ResolvedConfig
      : resolveConfig(..._configs)

    this.hooks = resolveHooks(this.config)
  }
}

interface ContextOptions {
  configs: ResolvedConfig | Arrayable<Config>
}
