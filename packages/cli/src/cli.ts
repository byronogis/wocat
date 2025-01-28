import { defineCommand, runMain } from 'citty'
import { handle } from '.'
import { description, version } from '../package.json'

const main = defineCommand({
  meta: {
    name: 'wocat',
    version,
    description,
  },
  args: {
    cwd: {
      type: 'string',
      description: 'Current working directory',
      valueHint: 'dir',
    },
    // TODO: add more features
    // interactive: {
    //   type: 'boolean',
    //   description: 'Interactive mode',
    //   alias: 'I',
    //   default: false,
    // },
    min: {
      type: 'string',
      description: 'Ony select dependencies greater than or equal to the specified count',
      alias: 'm',
      default: '1',
    },
    // all: {
    //   type: 'boolean',
    //   description: 'Select all dependencies, even if they are already cataloged',
    //   alias: 'A',
    //   default: false,
    // },
    watch: {
      type: 'boolean',
      description: 'Watch mode',
      alias: 'w',
    },
  },
  run({ args }) {
    handle({
      ...args,
    })
  },
})

runMain(main)
