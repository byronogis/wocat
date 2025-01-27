import type { SetRequired } from 'type-fest'
import type { FileItem } from './types'
import { loadConfig } from './config'
import { CoreContext } from './context'

export async function resolveCoreOptions(options: CoreOptions): Promise<ResolvedCoreOptions> {
  if (!options.ctx) {
    const configs = await loadConfig()
    options.ctx = new CoreContext({ configs })
  }

  return options as ResolvedCoreOptions
}

export async function core(_options: CoreOptions): Promise<CoreReturns> {
  const options = await resolveCoreOptions(_options)

  // await options.ctx.hooks.callHook('event:core:start', options)

  options.ctx.init(options)

  return options.ctx.run()
}

export interface CoreOptions {
  /**
   * core context
   */
  ctx?: CoreContext
  /**
   * pnpm-workspace.yaml file
   */
  configFile: FileItem<'yaml'>
  /**
   * package.json files
   */
  packageFiles: FileItem<'json'>[]
  // ...
}

export type ResolvedCoreOptions = SetRequired<CoreOptions, 'ctx'>

export type CoreReturns = Pick<CoreOptions, 'configFile' | 'packageFiles'>
