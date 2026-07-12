const googleCalendarIntegrationService = require('../services/googleCalendarIntegrationService');
const logger = require('../utils/logger');

function frontendOrigin() {
  return (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',')[0].trim();
}

async function getAuthUrl(req, res, next) {
  try {
    const url = googleCalendarIntegrationService.getAuthUrl(req.user.tenantId, req.user.id);
    res.json({ url });
  } catch (err) {
    next(err);
  }
}

// Alvo do redirect do navegador vindo do Google — nunca chamado via axios
// pelo frontend, por isso responde sempre com um redirect (sucesso ou erro),
// nunca com JSON de erro.
async function callback(req, res) {
  const { code, state, error } = req.query;

  if (error || !code || !state) {
    return res.redirect(`${frontendOrigin()}/#/configuracoes?google_calendar=error`);
  }

  try {
    await googleCalendarIntegrationService.handleCallback(code, state);
    res.redirect(`${frontendOrigin()}/#/configuracoes?google_calendar=connected`);
  } catch (err) {
    logger.error('[google-calendar] falha no callback OAuth', { message: err.message });
    res.redirect(`${frontendOrigin()}/#/configuracoes?google_calendar=error`);
  }
}

module.exports = { getAuthUrl, callback };
