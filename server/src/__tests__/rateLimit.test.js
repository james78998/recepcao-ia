const express = require('express');
const request = require('http');
const createRateLimiter = require('../middlewares/rateLimit');

// Sobe um servidor real em porta efêmera — express-rate-limit depende do
// ciclo de requisição completo do Express, mockar req/res manualmente não
// exercitaria a lib de verdade.
function startTestServer(limiter) {
  const app = express();
  app.get('/teste', limiter, (req, res) => res.json({ ok: true }));
  return new Promise((resolve) => {
    const server = app.listen(0, () => resolve(server));
  });
}

function get(port) {
  return new Promise((resolve, reject) => {
    request.get(`http://127.0.0.1:${port}/teste`, (res) => {
      res.resume();
      resolve(res.statusCode);
    }).on('error', reject);
  });
}

describe('createRateLimiter', () => {
  it('permite requisições dentro do limite e bloqueia a partir do limite excedido', async () => {
    const limiter = createRateLimiter({ windowMs: 60_000, max: 2, message: 'Muitas tentativas.' });
    const server = await startTestServer(limiter);
    const port = server.address().port;

    try {
      expect(await get(port)).toBe(200);
      expect(await get(port)).toBe(200);
      expect(await get(port)).toBe(429); // 3ª requisição excede max: 2
    } finally {
      server.close();
    }
  });
});
