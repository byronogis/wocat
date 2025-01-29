import { copyFile } from 'node:fs/promises'
import { basename } from 'node:path'
import { glob } from 'tinyglobby'

glob('README*.md').then((files) => {
  files.forEach((file) => {
    copyFile(file, `packages/wocat/${basename(file)}`)
  })
})
