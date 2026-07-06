/**
 * Dev/demo convenience script — buat satu tagihan overdue+belum_bayar untuk
 * pertama kali (setelah ini, tombol "Reset & Kirim Ulang (demo)" di Dashboard
 * sudah cukup untuk memicu ulang tagihan yang sama berkali-kali, tidak perlu
 * script ini lagi).
 *
 * Usage:
 *   npm run reset-notif -- <tagihan_id> --overdue   // jatuh_tempo ke masa lalu
 *                                                    // (2020-01-01), status
 *                                                    // belum_bayar, notified_at
 *                                                    // NULL
 */
require('dotenv').config();
const { sequelize, Tagihan } = require('./models');

async function main() {
  const id = process.argv[2];
  const forceOverdue = process.argv.includes('--overdue');

  if (!id) {
    console.error('Pemakaian: npm run reset-notif -- <tagihan_id> [--overdue]');
    process.exit(1);
  }

  const tagihan = await Tagihan.findByPk(id);
  if (!tagihan) {
    console.error(`Tagihan id=${id} tidak ditemukan.`);
    process.exit(1);
  }

  tagihan.notified_at = null;
  if (forceOverdue) {
    tagihan.jatuh_tempo = '2020-01-01';
    tagihan.status = 'belum_bayar';
  }
  await tagihan.save();

  console.log(
    `Tagihan id=${id} direset. notified_at=NULL${forceOverdue ? ', jatuh_tempo=2020-01-01, status=belum_bayar' : ''}.`
  );
  console.log('Klik "Reset & Kirim Ulang (demo)" di Dashboard sekarang untuk memicu push.');

  await sequelize.close();
}

main().catch((err) => {
  console.error('Gagal reset:', err.message);
  process.exit(1);
});
