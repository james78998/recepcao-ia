const jwt = require('jsonwebtoken');
const googleOAuthClient = require('../integrations/google/googleOAuthClient');
const tenantIntegrationService = require('./tenantIntegrationService');
const AppError = require('../utils/AppError');

const STATE_EXPIRES_IN = '10m';

// O "state" do OAuth carrega tenantId/userId assinados (JWT_SECRET) — o
// callback do Google não tem Authorization header, então é assim que
// identificamos com segurança quem iniciou a conexão (evita CSRF/tenant mismatch).
function getAuthUrl(tenantId, userId) {
  const state = jwt.sign({ tenantId, userId }, process.env.JWT_SECRET, { expiresIn: STATE_EXPIRES_IN });
  return googleOAuthClient.getAuthUrl(state);
}

function verifyState(state) {
  try {
    const payload = jwt.verify(state, process.env.JWT_SECRET);
    return { tenantId: payload.tenantId, userId: payload.userId };
  } catch {
    throw new AppError('Solicitação de conexão com o Google inválida ou expirada.', 400);
  }
}

async function handleCallback(code, state) {
  const { tenantId, userId } = verifyState(state);
  const tokens = await googleOAuthClient.exchangeCodeForTokens(code);

  await tenantIntegrationService.connect(tenantId, userId, 'GOOGLE_CALENDAR', {
    credentials: tokens,
    metadata: { calendarId: 'primary' },
    providerVersion: 'v3',
  });

  return { tenantId };
}

module.exports = { getAuthUrl, handleCallback };
