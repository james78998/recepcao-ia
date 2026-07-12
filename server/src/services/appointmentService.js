const appointmentRepository = require('../repositories/appointmentRepository');
const leadRepository = require('../repositories/leadRepository');
const tenantScheduleConfigService = require('./tenantScheduleConfigService');
const googleCalendarSyncService = require('./googleCalendarSyncService');
const domainEvents = require('../utils/domainEvents');
const { AUTOMATION_EVENT_NAMES } = require('../constants/automation');
const AppError = require('../utils/AppError');

async function assertLeadBelongsToTenant(leadId, tenantId) {
  if (!leadId) return null;
  const lead = await leadRepository.findById(leadId, tenantId);
  if (!lead) throw new AppError('Lead não encontrado.', 404);
  return lead;
}

function assertValidRange(startAt, endAt) {
  if (endAt <= startAt) {
    throw new AppError('O término deve ser depois do início.', 400);
  }
}

async function list(tenantId, { from, to } = {}) {
  return appointmentRepository.findAllByTenant(tenantId, { from, to });
}

async function getById(id, tenantId) {
  const appointment = await appointmentRepository.findById(id, tenantId);
  if (!appointment) throw new AppError('Compromisso não encontrado.', 404);
  return appointment;
}

async function create(tenantId, data) {
  const lead = await assertLeadBelongsToTenant(data.leadId, tenantId);

  const startAt = new Date(data.startAt);
  let endAt = data.endAt ? new Date(data.endAt) : null;
  if (!endAt) {
    const { defaultAppointmentDurationMin } = await tenantScheduleConfigService.getOrDefault(tenantId);
    endAt = new Date(startAt.getTime() + defaultAppointmentDurationMin * 60000);
  }
  assertValidRange(startAt, endAt);

  const appointment = await appointmentRepository.create({
    tenantId,
    leadId: data.leadId ?? null,
    clientName: data.clientName ?? lead?.name ?? null,
    title: data.title,
    description: data.description ?? null,
    location: data.location ?? null,
    startAt,
    endAt,
    status: data.status ?? 'SCHEDULED',
  });

  domainEvents.emit(AUTOMATION_EVENT_NAMES.APPOINTMENT_CREATED, { tenantId, data: appointment });
  googleCalendarSyncService.syncCreate(tenantId, appointment); // fire-and-forget — nunca lança
  return appointment;
}

async function update(id, tenantId, data) {
  const existing = await getById(id, tenantId);
  if (data.leadId !== undefined) await assertLeadBelongsToTenant(data.leadId, tenantId);

  const startAt = data.startAt ? new Date(data.startAt) : existing.startAt;
  const endAt = data.endAt ? new Date(data.endAt) : existing.endAt;
  assertValidRange(startAt, endAt);

  const appointment = await appointmentRepository.update(id, { ...data, startAt, endAt });
  googleCalendarSyncService.syncUpdate(tenantId, appointment); // fire-and-forget — nunca lança
  return appointment;
}

async function remove(id, tenantId) {
  const existing = await getById(id, tenantId);
  await appointmentRepository.remove(id);
  googleCalendarSyncService.syncDelete(tenantId, existing); // fire-and-forget — nunca lança
}

module.exports = { list, getById, create, update, remove };
