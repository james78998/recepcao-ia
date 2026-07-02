const prisma = require('./prisma');

async function create(data) {
  return prisma.auditLog.create({ data });
}

module.exports = { create };
