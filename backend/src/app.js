const express = require('express');
const cors = require('cors');
require('dotenv').config();

const passport = require('./config/passport');
const routes = require('./routes');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());
app.use(passport.initialize());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint tidak ditemukan' });
});

// error handler terpusat (harus paling akhir)
app.use(errorMiddleware);

module.exports = app;
