jest.mock('../repositories/appointmentRepository');
jest.mock('../repositories/leadRepository');
jest.mock('../services/tenantScheduleConfigService');
jest.mock('../services/googleCalendarSyncService');
jest.mock('../utils/domainEvents');

const appointmentRepository = require('../repositories/appointmentRepository');
const leadRepository = require('../repositories/leadRepository');
const tenantScheduleConfigService = require('../services/tenantScheduleConfigService');
const googleCalendarSyncService = require('../services/googleCalendarSyncService');
const domainEvents = require('../utils/domainEvents');
const { list, getById, create, update, remove } = require('../services/appointmentService');

const TENANT_ID = 'tenant-1';
const APPOINTMENT_ID = 'appointment-1';

beforeEach(() => {
  jest.clearAllMocks();
  tenantScheduleConfigService.getOrDefault.mockResolvedValue({
    timezone: 'America/Sao_Paulo',
    defaultAppointmentDurationMin: 30,
    bufferBetweenAppointmentsMin: 0,
  });
});

describe('appointmentService.list', () => {
  it('repassa tenantId e filtros de data para o repository', async () => {
    appointmentRepository.findAllByTenant.mockResolvedValue([]);

    await list(TENANT_ID, { from: '2026-07-01', to: '2026-07-31' });

    expect(appointmentRepository.findAllByTenant).toHaveBeenCalledWith(TENANT_ID, {
      from: '2026-07-01',
      to: '2026-07-31',
    });
  });
});

describe('appointmentService.getById', () => {
  it('lança 404 quando o compromisso não existe ou não é do tenant', async () => {
    appointmentRepository.findById.mockResolvedValue(null);

    await expect(getById(APPOINTMENT_ID, TENANT_ID)).rejects.toMatchObject({ status: 404 });
  });
});

describe('appointmentService.create', () => {
  it('cria o compromisso e emite appointment.created', async () => {
    const created = { id: APPOINTMENT_ID, tenantId: TENANT_ID, title: 'Demonstração' };
    appointmentRepository.create.mockResolvedValue(created);

    const result = await create(TENANT_ID, {
      title: 'Demonstração',
      startAt: '2026-07-15T09:00:00',
      endAt: '2026-07-15T09:30:00',
    });

    expect(domainEvents.emit).toHaveBeenCalledWith('appointment.created', { tenantId: TENANT_ID, data: created });
    expect(googleCalendarSyncService.syncCreate).toHaveBeenCalledWith(TENANT_ID, created);
    expect(result).toBe(created);
  });

  it('usa a duração padrão do tenant quando endAt não é informado', async () => {
    appointmentRepository.create.mockResolvedValue({ id: APPOINTMENT_ID });

    await create(TENANT_ID, { title: 'Reunião', startAt: '2026-07-15T09:00:00' });

    expect(tenantScheduleConfigService.getOrDefault).toHaveBeenCalledWith(TENANT_ID);
    const callArgs = appointmentRepository.create.mock.calls[0][0];
    expect(callArgs.endAt.getTime() - callArgs.startAt.getTime()).toBe(30 * 60000);
  });

  it('não consulta a duração padrão quando endAt é informado', async () => {
    appointmentRepository.create.mockResolvedValue({ id: APPOINTMENT_ID });

    await create(TENANT_ID, {
      title: 'Reunião',
      startAt: '2026-07-15T09:00:00',
      endAt: '2026-07-15T10:00:00',
    });

    expect(tenantScheduleConfigService.getOrDefault).not.toHaveBeenCalled();
  });

  it('preenche clientName a partir do Lead quando leadId é informado sem clientName', async () => {
    leadRepository.findById.mockResolvedValue({ id: 'lead-1', tenantId: TENANT_ID, name: 'Clínica Sorriso' });
    appointmentRepository.create.mockResolvedValue({ id: APPOINTMENT_ID });

    await create(TENANT_ID, { title: 'Demonstração', leadId: 'lead-1', startAt: '2026-07-15T09:00:00' });

    const callArgs = appointmentRepository.create.mock.calls[0][0];
    expect(callArgs.clientName).toBe('Clínica Sorriso');
    expect(callArgs.leadId).toBe('lead-1');
  });

  it('lança 404 quando leadId não pertence ao tenant', async () => {
    leadRepository.findById.mockResolvedValue(null);

    await expect(
      create(TENANT_ID, { title: 'Demonstração', leadId: 'lead-inexistente', startAt: '2026-07-15T09:00:00' })
    ).rejects.toMatchObject({ status: 404 });
    expect(appointmentRepository.create).not.toHaveBeenCalled();
  });

  it('lança 400 quando o término não é depois do início', async () => {
    await expect(
      create(TENANT_ID, {
        title: 'Demonstração',
        startAt: '2026-07-15T09:00:00',
        endAt: '2026-07-15T08:00:00',
      })
    ).rejects.toMatchObject({ status: 400 });
    expect(appointmentRepository.create).not.toHaveBeenCalled();
  });
});

describe('appointmentService.update', () => {
  const EXISTING = {
    id: APPOINTMENT_ID,
    tenantId: TENANT_ID,
    startAt: new Date('2026-07-15T09:00:00'),
    endAt: new Date('2026-07-15T09:30:00'),
  };

  it('lança 404 quando o compromisso não existe', async () => {
    appointmentRepository.findById.mockResolvedValue(null);

    await expect(update(APPOINTMENT_ID, TENANT_ID, { title: 'Novo título' })).rejects.toMatchObject({ status: 404 });
  });

  it('atualiza mantendo o intervalo existente quando datas não são alteradas', async () => {
    appointmentRepository.findById.mockResolvedValue(EXISTING);
    appointmentRepository.update.mockResolvedValue({ ...EXISTING, title: 'Novo título' });

    await update(APPOINTMENT_ID, TENANT_ID, { title: 'Novo título' });

    expect(appointmentRepository.update).toHaveBeenCalledWith(APPOINTMENT_ID, {
      title: 'Novo título',
      startAt: EXISTING.startAt,
      endAt: EXISTING.endAt,
    });
    expect(googleCalendarSyncService.syncUpdate).toHaveBeenCalledWith(TENANT_ID, { ...EXISTING, title: 'Novo título' });
  });

  it('valida o lead quando leadId é alterado', async () => {
    appointmentRepository.findById.mockResolvedValue(EXISTING);
    leadRepository.findById.mockResolvedValue(null);

    await expect(update(APPOINTMENT_ID, TENANT_ID, { leadId: 'lead-inexistente' })).rejects.toMatchObject({
      status: 404,
    });
    expect(appointmentRepository.update).not.toHaveBeenCalled();
  });

  it('lança 400 quando a nova combinação de datas é inválida', async () => {
    appointmentRepository.findById.mockResolvedValue(EXISTING);

    await expect(
      update(APPOINTMENT_ID, TENANT_ID, { endAt: '2026-07-15T08:00:00' })
    ).rejects.toMatchObject({ status: 400 });
    expect(appointmentRepository.update).not.toHaveBeenCalled();
  });
});

describe('appointmentService.remove', () => {
  it('lança 404 quando o compromisso não existe', async () => {
    appointmentRepository.findById.mockResolvedValue(null);

    await expect(remove(APPOINTMENT_ID, TENANT_ID)).rejects.toMatchObject({ status: 404 });
    expect(appointmentRepository.remove).not.toHaveBeenCalled();
  });

  it('remove o compromisso quando ele existe', async () => {
    const existing = { id: APPOINTMENT_ID, tenantId: TENANT_ID };
    appointmentRepository.findById.mockResolvedValue(existing);

    await remove(APPOINTMENT_ID, TENANT_ID);

    expect(appointmentRepository.remove).toHaveBeenCalledWith(APPOINTMENT_ID);
    expect(googleCalendarSyncService.syncDelete).toHaveBeenCalledWith(TENANT_ID, existing);
  });
});
