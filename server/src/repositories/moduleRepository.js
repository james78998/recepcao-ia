const prisma = require('./prisma');

async function findAll(db = prisma) {
  return db.module.findMany({ orderBy: { key: 'asc' } });
}

async function findByKey(key, db = prisma) {
  return db.module.findUnique({ where: { key } });
}

async function upsertByKey({ key, name, description }, db = prisma) {
  return db.module.upsert({
    where: { key },
    update: { name, description },
    create: { key, name, description },
  });
}

module.exports = { findAll, findByKey, upsertByKey };
