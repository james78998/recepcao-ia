const prisma = require('./prisma');

function buildDateRangeFilter(from, to) {
  if (!from && !to) return {};
  return {
    startAt: {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {}),
    },
  };
}

async function findAllByTenant(tenantId, { from, to } = {}) {
  return prisma.appointment.findMany({
    where: { tenantId, ...buildDateRangeFilter(from, to) },
    orderBy: { startAt: 'asc' },
  });
}

async function findById(id, tenantId) {
  return prisma.appointment.findFirst({ where: { id, tenantId } });
}

async function create(data) {
  return prisma.appointment.create({ data });
}

async function update(id, data) {
  return prisma.appointment.update({ where: { id }, data });
}

async function remove(id) {
  return prisma.appointment.delete({ where: { id } });
}

module.exports = { findAllByTenant, findById, create, update, remove };
