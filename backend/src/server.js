require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');
const pushPoller = require('./services/pushPoller.service');

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Koneksi database berhasil.');

    // Untuk kebutuhan tes/demo cukup pakai sync. Untuk produksi, gunakan migration.
    await sequelize.sync({ alter: true });

    pushPoller.start(Number(process.env.PUSH_POLL_INTERVAL_MS) || 60000);

    app.listen(PORT, () => {
      console.log(`Server berjalan di http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Gagal konek ke database:', err.message);
    process.exit(1);
  }
}

start();
