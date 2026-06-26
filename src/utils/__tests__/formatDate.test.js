import { describe, it, expect } from 'vitest'
import { formatDate } from '../formatDate'

describe('formatDate', () => {
  it('retorna string no formato pt-BR (DD/MM/YYYY)', () => {
    // usa horário local para evitar deslocamento de fuso (UTC-3)
    expect(formatDate('2024-01-15T12:00:00')).toBe('15/01/2024')
  })

  it('retorna uma string para qualquer data válida', () => {
    const result = formatDate('2024-06-01')
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })
})
