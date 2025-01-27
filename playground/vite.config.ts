import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'
import { ViteEjsPlugin } from 'vite-plugin-ejs'
import pkg from '../package.json'

export default defineConfig({
  base: '/wocat',
  plugins: [
    UnoCSS(),
    ViteEjsPlugin({
      title: `wocat | Playground`,
      name: 'wocat',
      version: pkg.version,
      repo: pkg.repository.url,
    }),
  ],
})
