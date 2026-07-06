const rateLimit = require('express-rate-limit');

// Factory reutilizável — evita configurar express-rate-limit do zero em cada
// rota sensível (forgot-password hoje; login/change-password no futuro).
function createRateLimiter({ windowMs, max, message }) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: true, message },
  });
}

module.exports = createRateLimiter;
