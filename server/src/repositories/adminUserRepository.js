const prisma = require('./prisma');

async function findByEmail(email, db = prisma) {
  return db.adminUser.findUnique({ where: { email } });
}

async function findById(id, db = prisma) {
  return db.adminUser.findUnique({ where: { id } });
}

async function create(data, db = prisma) {
  return db.adminUser.create({ data });
}

module.exports = { findByEmail, findById, create };
