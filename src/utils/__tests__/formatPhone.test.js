import { describe, it, expect } from 'vitest'
import { formatPhone } from '../formatPhone'

describe('formatPhone', () => {
  it('formata número com 11 dígitos corretamente', () => {
    expect(formatPhone('11987654321')).toBe('(11) 98765-4321')
  })

  it('retorna a string original quando tem menos de 11 dígitos', () => {
    expect(formatPhone('1198765')).toBe('1198765')
  })

  it('remove caracteres não numéricos antes de formatar', () => {
    expect(formatPhone('(11) 98765-4321')).toBe('(11) 98765-4321')
  })
})
