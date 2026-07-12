export const STATUS_LABEL = {
  SCHEDULED: 'Agendado',
  CONFIRMED: 'Confirmado',
  CANCELED: 'Cancelado',
  COMPLETED: 'Concluído',
};

export const STATUS_OPTIONS = Object.entries(STATUS_LABEL).map(([value, label]) => ({
  value,
  label,
}));

export function getAppointmentStatusColor(status) {
  switch (status) {
    case 'SCHEDULED': return 'blue';
    case 'CONFIRMED': return 'green';
    case 'CANCELED': return 'red';
    case 'COMPLETED': return 'purple';
    default: return 'gray';
  }
}
