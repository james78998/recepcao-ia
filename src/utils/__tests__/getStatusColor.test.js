import { describe, it, expect } from 'vitest'
import { getStatusColor } from '../getStatusColor'

describe('getStatusColor', () => {
  it('"Novo lead" retorna "green"', () => {
    expect(getStatusColor('Novo lead')).toBe('green')
  })

  it('"Demonstração" retorna "blue"', () => {
    expect(getStatusColor('Demonstração')).toBe('blue')
  })

  it('"Proposta" retorna "orange"', () => {
    expect(getStatusColor('Proposta')).toBe('orange')
  })

  it('"Cliente" retorna "purple"', () => {
    expect(getStatusColor('Cliente')).toBe('purple')
  })

  it('status desconhecido retorna "gray"', () => {
    expect(getStatusColor('Desconhecido')).toBe('gray')
  })
})
