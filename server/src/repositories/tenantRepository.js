const prisma = require('./prisma');

const ADMIN_LIST_SELECT = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
  aiEnabled: true,
  whatsappPhoneNumberId: true,
  _count: { select: { users: true, leads: true, conversations: true } },
};

async function create(data, db = prisma) {
  return db.tenant.create({ data });
}

async function findByEmail(email, db = prisma) {
  return db.tenant.findUnique({ where: { email } });
}

async function findByWhatsappPhoneNumberId(phoneNumberId) {
  return prisma.tenant.findFirst({ where: { whatsappPhoneNumberId: phoneNumberId } });
}

async function findAllForAdmin() {
  return prisma.tenant.findMany({
    select: ADMIN_LIST_SELECT,
    orderBy: { createdAt: 'desc' },
  });
}

async function findByIdForAdmin(id) {
  return prisma.tenant.findUnique({
    where: { id },
    select: ADMIN_LIST_SELECT,
  });
}

module.exports = {
  create,
  findByEmail,
  findByWhatsappPhoneNumberId,
  findAllForAdmin,
  findByIdForAdmin,
};
