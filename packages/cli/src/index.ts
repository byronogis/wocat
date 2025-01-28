import type { CliConfig, ResolvedCliConfig } from './types'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import process from 'node:process'
import { core, CoreContext, CoreError, getWorkspacePackages, resolveConfig } from '@wocat/core'
import { cyan, dim, green } from 'colorette'
import { consola } from 'consola'
import { join, resolve } from 'pathe'
import { debounce } from 'perfect-debounce'
import { glob } from 'tinyglobby'
import { version } from '../package.json'
import { handleError } from './errors'
import { getWatcher } from './watcher'

const name = 'wocat'

const packageJsonFileName = 'package.json'
const configurationFileName = 'pnpm-workspace.yaml'

export async function handle(_config: CliConfig): Promise<void> {
  const fileCache = new Map<string, string>()

  const config = resolveConfig(_config) as ResolvedCliConfig

  /**
   * Check if the current working directory is a package, if not, exit
   */
  if (!existsSync(resolve(config.cwd, packageJsonFileName))) {
    handleError(new CoreError(`No package.json found in ${config.cwd}`))
    process.exit(1)
  }

  /**
   * Check if the configuration file exists, if not, create it when prompted
   */
  if (!existsSync(resolve(config.cwd, configurationFileName))) {
    await consola.prompt(
      `No ${cyan(configurationFileName)} file found, do you want to create it now?`,
      { type: 'confirm' },
    ).then((res) => {
      res
        ? writeFileSync(
            resolve(config.cwd, configurationFileName),
            ``,
            'utf8',
          )
        : process.exit(1)
    })
  }

  const packages = getWorkspacePackages(readFileSync(resolve(config.cwd, configurationFileName), 'utf8'))
  config.patterns = [
    configurationFileName, // include root configuration file
    packageJsonFileName, // include root package.json
    ...packages.map(pkg => join(pkg, packageJsonFileName)),
  ]

  const ctx = new CoreContext({ configs: config })

  // ctx.hooks.hook('event:cli:task:end', (/* options, res */) => {
  //   console.log('[wocat] event:cli:task:end' /* options, res */)
  // })

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

      if (type.startsWith('unlink')) {
        // unlink: file has been removed
        fileCache.delete(absolutePath)
      }
      else {
        const newContent = readFileSync(absolutePath, 'utf8')
        if (newContent === fileCache.get(absolutePath)) {
          return
        }
        fileCache.set(absolutePath, readFileSync(absolutePath, 'utf8'))
      }

      consola.log(`${green(type)} ${dim(file)}`)

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

    const coreOprions = {
      ctx,
      configFile: {
        ...sourceCache.find(({ id }) => id.endsWith(configurationFileName))!,
        type: 'yaml' as const,
      },
      packageFiles: sourceCache.filter(({ id }) => id.endsWith(packageJsonFileName)).map((file) => {
        return {
          ...file,
          type: 'json' as const,
        }
      }),
    }

    try {
      const res = await core(coreOprions)

      await Promise.all([res.configFile, ...res.packageFiles].map(async ({ id, content }) => {
        return writeFileSync(id, content, 'utf8')
      }))
      // await ctx.hooks.callHook('event:cli:task:end', coreOprions, res)
    }
    catch (error: any) {
      if (error instanceof CoreError) {
        throw new CoreError(`[@${name}/cli] ${error.message}`)
      }
      throw error
    }
  }
}
