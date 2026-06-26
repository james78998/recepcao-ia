const leadRepository = require('../repositories/leadRepository');
const { normalizePhone } = require('../utils/phoneUtils');

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
  return leadRepository.create({
    ...data,
    tenantId,
    phoneNormalized: normalizePhone(data.phone),
  });
}

async function update(id, tenantId, data) {
  await getById(id, tenantId);
  const payload = { ...data };
  if (data.phone !== undefined) {
    payload.phoneNormalized = normalizePhone(data.phone);
  }
  return leadRepository.update(id, payload);
}

async function remove(id, tenantId) {
  await getById(id, tenantId);
  return leadRepository.remove(id);
}

module.exports = { list, getById, create, update, remove };
