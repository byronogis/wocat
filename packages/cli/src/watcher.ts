import type { FSWatcher } from 'chokidar'
import type { CliConfig } from './types'
import { resolveConfig } from '@wocat/core'

let watcher: FSWatcher

export async function getWatcher(_config?: CliConfig): Promise<FSWatcher> {
  // test case entry without config
  if (watcher && !_config) {
    return watcher
  }

  const config = resolveConfig(_config ?? {})

  const { watch } = await import('chokidar')
  const ignored = ['**/{.git,node_modules}/**']
  // cli may create multiple watchers
  const newWatcher = watch(config?.patterns as string[], {
    ignoreInitial: true,
    ignorePermissionErrors: true,
    ignored,
    cwd: config.cwd,
  })
  watcher = newWatcher
  return newWatcher
}
