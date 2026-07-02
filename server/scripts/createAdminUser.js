// Cria um Super Admin da plataforma. Não há endpoint de registro público para AdminUser
// por design — contas de plataforma só são criadas por quem tem acesso ao servidor.
//
// Uso: node scripts/createAdminUser.js "Nome" email@exemplo.com "senha-forte"
require('dotenv').config();
const bcrypt = require('bcrypt');
const prisma = require('../src/repositories/prisma');

async function main() {
  const [name, email, password] = process.argv.slice(2);

  if (!name || !email || !password) {
    console.error('Uso: node scripts/createAdminUser.js "Nome" email@exemplo.com "senha-forte"');
    process.exitCode = 1;
    return;
  }

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    console.error(`Já existe um AdminUser com o e-mail ${email}.`);
    process.exitCode = 1;
    return;
  }

  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const admin = await prisma.adminUser.create({
    data: { name, email, passwordHash },
  });

  console.log(`AdminUser criado: ${admin.id} (${admin.email})`);
}

main()
  .catch((err) => {
    console.error('Erro ao criar AdminUser:', err.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
