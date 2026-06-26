import { describe, it, expect } from 'vitest'
import { getStatusColor } from '../getStatusColor'

describe('getStatusColor', () => {
  it('"NOVO" retorna "green"', () => {
    expect(getStatusColor('NOVO')).toBe('green')
  })

  it('"DEMONSTRACAO" retorna "blue"', () => {
    expect(getStatusColor('DEMONSTRACAO')).toBe('blue')
  })

  it('"PROPOSTA" retorna "orange"', () => {
    expect(getStatusColor('PROPOSTA')).toBe('orange')
  })

  it('"CLIENTE_ATIVO" retorna "purple"', () => {
    expect(getStatusColor('CLIENTE_ATIVO')).toBe('purple')
  })

  it('"PERDIDO" retorna "gray"', () => {
    expect(getStatusColor('PERDIDO')).toBe('gray')
  })

  it('status desconhecido retorna "gray"', () => {
    expect(getStatusColor('DESCONHECIDO')).toBe('gray')
  })
})
