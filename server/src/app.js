const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const router = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
// Side-effect: registra os listeners do Motor de Automações em domainEvents,
// uma única vez, no boot do processo — nenhum service de negócio depende
// deste módulo diretamente.
require('./services/automationDispatchService');

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(helmet());
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error('CORS: origem não permitida'));
    },
    credentials: true,
  })
);
// Captura o body bruto para validação da assinatura HMAC do webhook da Meta
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  },
}));
app.use(cookieParser());

app.get('/', (req, res) => {
  res.json({ name: 'Recepção IA API', status: 'online' });
});

app.use('/api', router);

app.use(errorHandler);

module.exports = app;
