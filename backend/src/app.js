const express = require('express');
const cors = require('cors');
require('dotenv').config();

const passport = require('./config/passport');
const routes = require('./routes');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

// FRONTEND_URL boleh berisi beberapa origin dipisah koma (misal untuk akses
// dari HP via LAN IP sekaligus localhost saat development).
const allowedOrigins = (process.env.FRONTEND_URL || '*')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: allowedOrigins.includes('*') ? '*' : allowedOrigins,
  })
);
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
