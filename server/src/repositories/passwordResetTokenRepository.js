const prisma = require('./prisma');

async function create(data) {
  return prisma.passwordResetToken.create({ data });
}

// Só retorna um token ainda válido (não expirado, não usado).
async function findValidByHash(tokenHash) {
  return prisma.passwordResetToken.findFirst({
    where: { tokenHash, usedAt: null, expiresAt: { gt: new Date() } },
  });
}

// Invalida (marca como usado) todos os tokens pendentes de um usuário — usado
// antes de gerar um pedido novo e depois de um reset bem-sucedido, para que
// nenhum link antigo continue válido.
async function invalidateAllForUser(userId) {
  return prisma.passwordResetToken.updateMany({
    where: { userId, usedAt: null },
    data: { usedAt: new Date() },
  });
}

module.exports = { create, findValidByHash, invalidateAllForUser };
