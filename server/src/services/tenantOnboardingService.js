const bcrypt = require('bcrypt');
const prisma = require('../repositories/prisma');
const userRepository = require('../repositories/userRepository');
const tenantRepository = require('../repositories/tenantRepository');

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);

// Cria um Tenant e seu usuário ADMIN inicial numa única transação.
// Compartilhado pelo cadastro público (authService.register) e pela
// criação manual de clientes pelo super admin (adminTenantService.create).
async function onboardTenant({ tenantName, tenantEmail, userName, userEmail, password }) {
  const [existingTenant, existingUser] = await Promise.all([
    tenantRepository.findByEmail(tenantEmail),
    userRepository.findByEmail(userEmail),
  ]);

  if (existingTenant) {
    const err = new Error('E-mail de empresa já cadastrado.');
    err.status = 409;
    throw err;
  }
  if (existingUser) {
    const err = new Error('E-mail de usuário já cadastrado.');
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const createdUser = await prisma.$transaction(async (tx) => {
    const tenant = await tenantRepository.create({ name: tenantName, email: tenantEmail }, tx);
    return userRepository.create(
      { tenantId: tenant.id, name: userName, email: userEmail, passwordHash, role: 'ADMIN' },
      tx
    );
  });

  return userRepository.findByIdWithTenant(createdUser.id);
}

module.exports = { onboardTenant };
