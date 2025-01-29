# wocat

<!-- automd:badges name="wocat" license codecov bundlephobia packagephobia -->

[![npm version](https://img.shields.io/npm/v/wocat)](https://npmjs.com/package/wocat)
[![npm downloads](https://img.shields.io/npm/dm/wocat)](https://npm.chart.dev/wocat)
[![bundle size](https://img.shields.io/bundlephobia/minzip/wocat)](https://bundlephobia.com/package/wocat)
[![codecov](https://img.shields.io/codecov/c/gh/byronogis/wocat)](https://codecov.io/gh/byronogis/wocat)
[![license](https://img.shields.io/github/license/byronogis/wocat)](https://github.com/byronogis/wocat/blob/main/LICENSE)

<!-- /automd -->

[![JSDocs][jsdocs-src]][jsdocs-href]

Convert regular dependencies to [Catalogs](https://pnpm.io/catalogs).

## Basic Usage

```bash
npx wocat
```

## Options

```bash
USAGE wocat [OPTIONS]

OPTIONS

        --cwd=<dir>    Current working directory
  -I, --interactive    Interactive mode
      -m, --min="1"    Ony select dependencies greater than or equal to the specified count
       -f, --filter    Filter dependencies by name, can use regular expressions
        -w, --watch    Watch mode
```

<!-- automd:fetch url="gh:byronogis/.github/main/snippets/readme-contrib-node-pnpm.md" -->

## Contribution

<details>
  <summary>Local development</summary>

- Clone this repository
- Install the latest LTS version of [Node.js](https://nodejs.org/en/)
- Enable [Corepack](https://github.com/nodejs/corepack) using `corepack enable`
- Install dependencies using `pnpm install`
- Run tests using `pnpm dev` or `pnpm test`

</details>

<!-- /automd -->

## Sponsors

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/byronogis/static/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/byronogis/static/sponsors.svg'/>
  </a>
</p>

## License

<!-- automd:contributors author="byronogis" license="MIT" -->

Published under the [MIT](https://github.com/byronogis/wocat/blob/main/LICENSE) license.
Made by [@byronogis](https://github.com/byronogis) and [community](https://github.com/byronogis/wocat/graphs/contributors) 💛
<br><br>
<a href="https://github.com/byronogis/wocat/graphs/contributors">
<img src="https://contrib.rocks/image?repo=byronogis/wocat" />
</a>

<!-- /automd -->

<!-- automd:with-automd lastUpdate -->

---

_🤖 auto updated with [automd](https://automd.unjs.io) (last updated: Wed Jan 29 2025)_

<!-- /automd -->

<!-- Badges -->

[jsdocs-src]: https://img.shields.io/badge/jsdocs-reference-1fa669
[jsdocs-href]: https://www.jsdocs.io/package/wocat
