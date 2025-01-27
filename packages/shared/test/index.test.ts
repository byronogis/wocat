import { describe, expect, it } from 'vitest'
import { sharedFunction } from '../src'

describe('shared', () => {
  it('should return string', () => {
    expect(sharedFunction()).toBe('shared')
  })
})
