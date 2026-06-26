const prisma = require('./prisma');

async function findByEmail(email, db = prisma) {
  return db.user.findUnique({ where: { email } });
}

async function findByEmailWithTenant(email, db = prisma) {
  return db.user.findUnique({ where: { email }, include: { tenant: true } });
}

async function findById(id, db = prisma) {
  return db.user.findUnique({ where: { id } });
}

async function findByIdWithTenant(id, db = prisma) {
  return db.user.findUnique({ where: { id }, include: { tenant: true } });
}

async function create(data, db = prisma) {
  return db.user.create({ data });
}

module.exports = { findByEmail, findByEmailWithTenant, findById, findByIdWithTenant, create };
