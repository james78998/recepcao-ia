const prisma = require('./prisma');

async function existsByWamid(wamid) {
  const msg = await prisma.message.findUnique({
    where: { wamid },
    select: { id: true },
  });
  return !!msg;
}

async function create(data) {
  return prisma.message.create({ data });
}

module.exports = { existsByWamid, create };
