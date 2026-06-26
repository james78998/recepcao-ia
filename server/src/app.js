const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const router = require('./routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ name: 'Recepção IA API', status: 'online' });
});

app.use('/api', router);

app.use(errorHandler);

module.exports = app;
