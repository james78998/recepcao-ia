const { PrismaClient } = require('@prisma/client');

// Reutiliza a instância em desenvolvimento para evitar esgotamento de conexões
// com hot-reload do nodemon.
const prisma = global.__prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}

module.exports = prisma;
