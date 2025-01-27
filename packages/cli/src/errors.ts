import process from 'node:process'
import { CoreError } from '@wocat/core'
import { consola } from 'consola'

export function handleError(error: unknown): void {
  if (error instanceof CoreError) {
    consola.error(error.message)
  }
  else {
    console.error(error)
  }

  process.exitCode = 1
}
