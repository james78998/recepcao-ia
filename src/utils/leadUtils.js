export const STATUS_LABEL = {
  NOVO: 'Novo lead',
  DEMONSTRACAO: 'Demonstração',
  PROPOSTA: 'Proposta',
  CLIENTE_ATIVO: 'Cliente ativo',
  PERDIDO: 'Perdido',
};

export const STATUS_OPTIONS = Object.entries(STATUS_LABEL).map(([value, label]) => ({
  value,
  label,
}));
