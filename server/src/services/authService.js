const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const passwordResetTokenRepository = require('../repositories/passwordResetTokenRepository');
const tenantOnboardingService = require('./tenantOnboardingService');
const emailService = require('./emailService');
const domainEvents = require('../utils/domainEvents');
const { AUTOMATION_EVENT_NAMES } = require('../constants/automation');

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
const RESET_TOKEN_EXPIRES_MIN = parseInt(process.env.PASSWORD_RESET_TOKEN_EXPIRES_MIN || '60', 10);

function hashResetToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

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
      aiEnabled: user.tenant.aiEnabled,
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

async function updateMe(userId, { name, email }) {
  if (email) {
    const existing = await userRepository.findByEmail(email);
    if (existing && existing.id !== userId) {
      const err = new Error('E-mail já cadastrado por outro usuário.');
      err.status = 409;
      throw err;
    }
  }

  await userRepository.update(userId, { name, email });
  return me(userId);
}

async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await userRepository.findById(userId);
  if (!user) {
    const err = new Error('Usuário não encontrado.');
    err.status = 404;
    throw err;
  }

  const passwordMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!passwordMatch) {
    const err = new Error('Senha atual incorreta.');
    err.status = 401;
    throw err;
  }

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await userRepository.update(userId, { passwordHash });
}

// Sempre "sucede" do ponto de vista do chamador (controller sempre responde
// a mesma mensagem genérica) — nunca revela se o e-mail existe ou não.
async function forgotPassword(email) {
  const user = await userRepository.findByEmail(email);
  if (!user) return;

  await passwordResetTokenRepository.invalidateAllForUser(user.id);

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRES_MIN * 60 * 1000);

  await passwordResetTokenRepository.create({
    userId: user.id,
    tokenHash: hashResetToken(token),
    expiresAt,
  });

  // CORS_ORIGIN já é a origem pública do frontend — reaproveitado aqui para
  // montar o link em vez de introduzir uma variável nova para o mesmo dado.
  // CORS_ORIGIN pode ter várias origens separadas por vírgula (ver app.js);
  // para o link usamos só a primeira, senão a URL sai quebrada.
  const frontendOrigin = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',')[0].trim();
  const resetLink = `${frontendOrigin}/#/redefinir-senha?token=${token}`;

  // Fire-and-forget: não bloqueia a resposta no tempo de envio do e-mail
  // (mesmo padrão de aiService.generateReply em whatsappService.js). Além de
  // não travar o fluxo principal, evita que o tempo de resposta desta rota
  // varie entre "e-mail existe" (envia e-mail) e "não existe" (retorna já) —
  // essa diferença de latência seria um canal lateral de enumeração de e-mail.
  emailService.sendPasswordResetEmail(user.email, resetLink);

  domainEvents.emit(AUTOMATION_EVENT_NAMES.USER_PASSWORD_RESET_REQUESTED, {
    tenantId: user.tenantId,
    data: { id: user.id, name: user.name, email: user.email },
  });
}

async function resetPassword(token, newPassword) {
  const record = await passwordResetTokenRepository.findValidByHash(hashResetToken(token));
  if (!record) {
    const err = new Error('Token inválido ou expirado.');
    err.status = 400;
    throw err;
  }

  const user = await userRepository.findById(record.userId);
  if (!user) {
    const err = new Error('Token inválido ou expirado.');
    err.status = 400;
    throw err;
  }

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await userRepository.update(user.id, { passwordHash });
  await passwordResetTokenRepository.invalidateAllForUser(user.id);

  domainEvents.emit(AUTOMATION_EVENT_NAMES.USER_PASSWORD_RESET_COMPLETED, {
    tenantId: user.tenantId,
    data: { id: user.id, name: user.name, email: user.email },
  });
}

module.exports = { register, login, refresh, me, updateMe, changePassword, forgotPassword, resetPassword };
