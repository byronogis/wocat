import type { Hookable } from 'hookable'
import type { ResolvedConfig } from './config'
import type { CoreReturns, ResolvedCoreOptions } from './core'
import { createHooks } from 'hookable'

export function resolveHooks(_config: ResolvedConfig): Hookable<Hooks> {
  const hooks = createHooks<Hooks>()

  hooks.hook('event:core:start', (/* option */) => {
    console.log('[wocat] event:core:start' /* option */)
  })

  return hooks
}

export interface Hooks {
  'event:core:start': (option: ResolvedCoreOptions) => void
  'event:cli:task:end': (option: ResolvedCoreOptions, res: CoreReturns) => void
}

export type HookKeys = keyof Hooks
