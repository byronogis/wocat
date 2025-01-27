import { parse } from 'yaml'
import { CoreError } from './errors'

/**
 * Get the workspace packages (pattern) from the configuration file
 *
 * 获取工作空间范围内的包
 *
 * @param yaml - content of the configuration file
 */
export function getWorkspacePackages(yaml: string): string[] {
  const parsed = parse(yaml)
  const packages = parsed.packages ?? []

  if (!Array.isArray(packages) || packages.some(pkg => typeof pkg !== 'string')) {
    throw new CoreError('Invalid workspace packages, please check the configuration file, and make sure the `packages` field is an array of strings.')
  }

  return packages
}
