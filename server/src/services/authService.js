const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const tenantOnboardingService = require('./tenantOnboardingService');

function generateTokens(user) {
  const payload = { sub: user.id, tenantId: user.tenantId, role: user.role };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
  return { accessToken, refreshToken };
}

function formatUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    tenantId: user.tenantId,
    tenant: {
      id: user.tenant.id,
      name: user.tenant.name,
    },
  };
}

async function register({ tenantName, tenantEmail, userName, userEmail, password }) {
  const userWithTenant = await tenantOnboardingService.onboardTenant({
    tenantName,
    tenantEmail,
    userName,
    userEmail,
    password,
  });

  const { accessToken, refreshToken } = generateTokens(userWithTenant);
  return { accessToken, refreshToken, user: formatUser(userWithTenant) };
}

async function login({ email, password }) {
  const user = await userRepository.findByEmailWithTenant(email);
  const passwordMatch = user ? await bcrypt.compare(password, user.passwordHash) : false;

  if (!user || !passwordMatch) {
    const err = new Error('Credenciais inválidas.');
    err.status = 401;
    throw err;
  }

  const { accessToken, refreshToken } = generateTokens(user);
  return { accessToken, refreshToken, user: formatUser(user) };
}

async function refresh(refreshToken) {
  let payload;
  try {
    payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    const err = new Error('Refresh token inválido ou expirado.');
    err.status = 401;
    throw err;
  }

  const user = await userRepository.findByIdWithTenant(payload.sub);
  if (!user) {
    const err = new Error('Usuário não encontrado.');
    err.status = 401;
    throw err;
  }

  const accessToken = jwt.sign(
    { sub: user.id, tenantId: user.tenantId, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );

  return { accessToken, user: formatUser(user) };
}

async function me(userId) {
  const user = await userRepository.findByIdWithTenant(userId);
  if (!user) {
    const err = new Error('Usuário não encontrado.');
    err.status = 404;
    throw err;
  }
  return formatUser(user);
}

module.exports = { register, login, refresh, me };
