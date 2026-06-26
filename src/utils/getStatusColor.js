export function getStatusColor(status) {
  switch (status) {
    case 'NOVO': return 'green';
    case 'DEMONSTRACAO': return 'blue';
    case 'PROPOSTA': return 'orange';
    case 'CLIENTE_ATIVO': return 'purple';
    case 'PERDIDO': return 'gray';
    default: return 'gray';
  }
}
