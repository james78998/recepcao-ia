const prisma = require('./prisma');

async function create(data, db = prisma) {
  return db.tenant.create({ data });
}

async function findByEmail(email, db = prisma) {
  return db.tenant.findUnique({ where: { email } });
}

async function findByWhatsappPhoneNumberId(phoneNumberId) {
  return prisma.tenant.findFirst({ where: { whatsappPhoneNumberId: phoneNumberId } });
}

module.exports = { create, findByEmail, findByWhatsappPhoneNumberId };
