const { normalizePhone } = require('../utils/phoneUtils');

describe('normalizePhone', () => {
  it('remove formatação brasileira completa', () => {
    expect(normalizePhone('+55 (11) 98888-7777')).toBe('5511988887777');
  });

  it('remove traços e parênteses sem código de país', () => {
    expect(normalizePhone('(11) 98888-7777')).toBe('11988887777');
  });

  it('mantém número já normalizado (somente dígitos)', () => {
    expect(normalizePhone('5511988887777')).toBe('5511988887777');
  });

  it('mantém número E.164 com + removendo o sinal', () => {
    expect(normalizePhone('+5511988887777')).toBe('5511988887777');
  });

  it('remove espaços entre dígitos', () => {
    expect(normalizePhone('55 11 9 8888 7777')).toBe('5511988887777');
  });

  it('retorna null para null', () => {
    expect(normalizePhone(null)).toBeNull();
  });

  it('retorna null para undefined', () => {
    expect(normalizePhone(undefined)).toBeNull();
  });

  it('retorna null para string vazia', () => {
    expect(normalizePhone('')).toBeNull();
  });

  it('retorna null para string com apenas caracteres não-numéricos', () => {
    expect(normalizePhone('---')).toBeNull();
    expect(normalizePhone('()')).toBeNull();
  });

  it('preserva número curto (sem código de país)', () => {
    expect(normalizePhone('9 8888-7777')).toBe('988887777');
  });
});
