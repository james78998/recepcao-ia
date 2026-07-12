const prisma = require('./prisma');

async function create(data) {
  return prisma.adminAuditLog.create({ data });
}

module.exports = { create };
