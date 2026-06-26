const prisma = require('./prisma');

const ALL_STATUSES = ['NOVO', 'DEMONSTRACAO', 'PROPOSTA', 'CLIENTE_ATIVO', 'PERDIDO'];

function buildSearchFilter(search) {
  if (!search) return {};
  return {
    OR: [
      { name: { contains: search, mode: 'insensitive' } },
      { company: { contains: search, mode: 'insensitive' } },
      { segment: { contains: search, mode: 'insensitive' } },
    ],
  };
}

async function findAll({ tenantId, search, status, page = 1, perPage = 10 }) {
  const where = {
    tenantId,
    ...(status ? { status } : {}),
    ...buildSearchFilter(search),
  };

  const [total, data, statusCounts] = await Promise.all([
    prisma.lead.count({ where }),
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.lead.groupBy({
      by: ['status'],
      where: { tenantId },
      _count: { status: true },
    }),
  ]);

  const stats = Object.fromEntries(ALL_STATUSES.map((s) => [s, 0]));
  statusCounts.forEach(({ status: s, _count }) => {
    stats[s] = _count.status;
  });

  return {
    data,
    meta: { total, page, perPage, totalPages: Math.ceil(total / perPage) || 1 },
    stats,
  };
}

async function findById(id, tenantId) {
  return prisma.lead.findFirst({ where: { id, tenantId } });
}

async function create(data) {
  return prisma.lead.create({ data });
}

async function update(id, data) {
  return prisma.lead.update({ where: { id }, data });
}

async function remove(id) {
  return prisma.lead.delete({ where: { id } });
}

module.exports = { findAll, findById, create, update, remove };
