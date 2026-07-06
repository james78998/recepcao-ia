const leadRepository = require('../repositories/leadRepository');
const { normalizePhone } = require('../utils/phoneUtils');
const domainEvents = require('../utils/domainEvents');
const { AUTOMATION_EVENT_NAMES } = require('../constants/automation');

function notFound() {
  const err = new Error('Lead não encontrado.');
  err.status = 404;
  return err;
}

async function list({ tenantId, search, status, page, perPage }) {
  return leadRepository.findAll({
    tenantId,
    search: search || undefined,
    status: status || undefined,
    page: Math.max(1, parseInt(page) || 1),
    perPage: Math.min(100, Math.max(1, parseInt(perPage) || 10)),
  });
}

async function getById(id, tenantId) {
  const lead = await leadRepository.findById(id, tenantId);
  if (!lead) throw notFound();
  return lead;
}

async function create(tenantId, data) {
  const lead = await leadRepository.create({
    ...data,
    tenantId,
    phoneNormalized: normalizePhone(data.phone),
  });
  domainEvents.emit(AUTOMATION_EVENT_NAMES.LEAD_CREATED, { tenantId, data: lead });
  return lead;
}

async function update(id, tenantId, data) {
  await getById(id, tenantId);
  const payload = { ...data };
  if (data.phone !== undefined) {
    payload.phoneNormalized = normalizePhone(data.phone);
  }
  const lead = await leadRepository.update(id, payload);
  domainEvents.emit(AUTOMATION_EVENT_NAMES.LEAD_UPDATED, { tenantId, data: lead });
  return lead;
}

async function remove(id, tenantId) {
  await getById(id, tenantId);
  return leadRepository.remove(id);
}

module.exports = { list, getById, create, update, remove };
