const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const adminUserRepository = require('../repositories/adminUserRepository');

function formatAdmin(admin) {
  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
  };
}

async function login({ email, password }) {
  const admin = await adminUserRepository.findByEmail(email);
  const passwordMatch = admin ? await bcrypt.compare(password, admin.passwordHash) : false;

  if (!admin || !passwordMatch) {
    const err = new Error('Credenciais inválidas.');
    err.status = 401;
    throw err;
  }

  if (!admin.isActive) {
    const err = new Error('Conta desativada.');
    err.status = 401;
    throw err;
  }

  const accessToken = jwt.sign(
    { sub: admin.id, role: admin.role },
    process.env.ADMIN_JWT_SECRET,
    { expiresIn: process.env.ADMIN_JWT_EXPIRES_IN || '2h' }
  );

  return { accessToken, admin: formatAdmin(admin) };
}

module.exports = { login };
