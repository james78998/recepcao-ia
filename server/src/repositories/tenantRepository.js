const prisma = require('./prisma');

async function create(data, db = prisma) {
  return db.tenant.create({ data });
}

async function findByEmail(email, db = prisma) {
  return db.tenant.findUnique({ where: { email } });
}

module.exports = { create, findByEmail };
