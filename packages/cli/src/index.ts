import type { CliConfig, ResolvedCliConfig } from './types'
import { readFileSync } from 'node:fs'
import process from 'node:process'
import { core, CoreContext, CoreError, loadConfig } from '@wocat/core'
import { cyan, dim, green } from 'colorette'
import { consola } from 'consola'
import { resolve } from 'pathe'
import { debounce } from 'perfect-debounce'
import { glob } from 'tinyglobby'
import { version } from '../package.json'
import { handleError } from './errors'
import { getWatcher } from './watcher'

const name = 'wocat'

export async function handle(_config: CliConfig): Promise<void> {
  const fileCache = new Map<string, string>()

  const config = await loadConfig<CliConfig>(_config) as ResolvedCliConfig

  if (!config.patterns?.length) {
    handleError(new CoreError(`No glob patterns, try ${cyan(`${name} <path/to/**/*>`)}`))
    process.exit(1)
  }

  const ctx = new CoreContext({ configs: config })

  ctx.hooks.hook('event:cli:task:end', (/* options, res */) => {
    console.log('[wocat] event:cli:task:end' /* options, res */)
  })

  const files = await glob([
    ...config.patterns,
  ], {
    cwd: config.cwd,
    absolute: true,
    expandDirectories: false,
  })
  await Promise.all(files.map(async (file) => {
    fileCache.set(file, readFileSync(file, 'utf8'))
  }))

  consola.log(green(`${name} v${version}`))

  if (config.watch) {
    consola.start(`${name} in watch mode...`)
  }
  else {
    consola.start(`${name} for production...`)
  }

  const debouncedBuild = debounce(
    async () => {
      task(ctx).catch(handleError)
    },
    100,
  )

  await task(ctx)

  if (config.watch) {
    await startWatcher().catch(handleError)
  }
  else {
    consola.success(`${name} done`)
  }

  async function startWatcher(): Promise<void> {
    const watcher = await getWatcher(config)

    watcher.on('all', async (type, file) => {
      const absolutePath = resolve(config.cwd, file)

      consola.log(`${green(type)} ${dim(file)}`)

      if (type.startsWith('unlink')) {
        // unlink: file has been removed
        fileCache.delete(absolutePath)
      }
      else {
        fileCache.set(absolutePath, readFileSync(absolutePath, 'utf8'))
      }

      debouncedBuild()
    })

    consola.info(
      `Watching for changes in ${(config.patterns)
        .map((i: string) => cyan(i))
        .join(', ')}`,
    )
  }

  /**
   * Task
   *
   * 此次任务
   */
  async function task(ctx: CoreContext): Promise<void> {
    const sourceCache = Array.from(fileCache).map(([id, content]) => ({ id, content }))

    const coreOprions = { ctx, files: sourceCache.map(({ id }) => id) }

    try {
      const res = await core(coreOprions)
      await ctx.hooks.callHook('event:cli:task:end', coreOprions, res)
    }
    catch (error: any) {
      if (error instanceof CoreError) {
        throw new CoreError(`[@${name}/cli] ${error.message}`)
      }
      throw error
    }
  }
}
