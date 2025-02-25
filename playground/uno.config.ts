import {
  defineConfig,
  presetIcons,
  presetTypography,
  presetWind3,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  presets: [
    presetWind3(),
    presetIcons(),
    presetTypography(),
  ],
  transformers: [
    transformerVariantGroup(),
    transformerDirectives(),
  ],
  safelist: [
    // ...
  ],
  rules: [
    [/^grid-wrap-(.+)$/, ([, s]) => ({ 'grid-template-columns': `repeat(auto-fit, minmax(${s}, 1fr))` })],
  ],
})
