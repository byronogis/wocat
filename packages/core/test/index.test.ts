import { describe, expect, it } from 'vitest'
import { core } from '../src'

describe('core', () => {
  it('should add return string', async () => {
    expect(await core({})).toBe('[wocat] core')
  })
})
