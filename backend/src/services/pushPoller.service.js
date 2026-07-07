const { Op } = require('sequelize');
const { Tagihan, Unit, User } = require('../models');
const { sendToUsers, sendToAdmins } = require('./push.service');

// Cari tagihan belum_bayar yang sudah lewat jatuh_tempo dan belum pernah
// dinotifikasi (notified_at IS NULL), kirim push ke semua admin (semua tagihan)
// DAN ke pemilik unit tersebut (tagihan miliknya sendiri), lalu tandai
// notified_at supaya tidak dikirim berulang di poll berikutnya.
async function checkOverdueInvoices() {
  const overdue = await Tagihan.findAll({
    where: {
      status: 'belum_bayar',
      notified_at: null,
      jatuh_tempo: { [Op.lt]: new Date() },
    },
    include: [
      { model: Unit, as: 'unit', include: [{ model: User, as: 'pemilik', attributes: ['id', 'nama', 'push_subscription', 'fcm_token'] }] },
    ],
  });

  const notified = [];

  for (const inv of overdue) {
    const unitName = inv.unit?.nama_unit || inv.unit_id;
    const adminPayload = {
      title: 'Tagihan Jatuh Tempo',
      body: `Unit ${unitName} periode ${inv.periode}.\nHarap segera melunasi tagihan.`,
      data: { tagihanId: inv.id, unitId: inv.unit_id },
    };

    const adminResults = await sendToAdmins(adminPayload);

    let pemilikResults = [];
    if (inv.unit?.pemilik) {
      const pemilikPayload = {
        title: 'Tagihan Jatuh Tempo',
        body: `Unit ${unitName} periode ${inv.periode}.\nHarap segera melunasi tagihan.`,
        data: { tagihanId: inv.id, unitId: inv.unit_id },
      };
      pemilikResults = await sendToUsers([inv.unit.pemilik], pemilikPayload);
    }

    // Hanya tandai notified_at kalau setidaknya satu pengiriman benar-benar
    // berhasil (atau memang tidak ada satu pun yang subscribe). Kalau semua
    // percobaan pengiriman gagal (bukan karena belum subscribe), biarkan
    // notified_at tetap NULL supaya dicoba lagi di siklus poll berikutnya.
    const allResults = [...adminResults, ...pemilikResults];
    const allFailed = allResults.length > 0 && allResults.every((r) => !r.ok);

    if (allFailed) {
      console.error(`Semua pengiriman push untuk tagihan #${inv.id} gagal, akan dicoba lagi di poll berikutnya.`);
      continue;
    }

    inv.notified_at = new Date();
    await inv.save();
    notified.push(inv.id);
  }

  return notified;
}

// Debug/demo only: reset notified_at pada semua tagihan yang sedang overdue+belum
// bayar, supaya checkOverdueInvoices() bisa langsung menotifikasi ulang tanpa
// perlu reset manual lewat SQL/script terpisah setiap kali demo diulang.
async function resetOverdueNotifications() {
  const [count] = await Tagihan.update(
    { notified_at: null },
    { where: { status: 'belum_bayar', jatuh_tempo: { [Op.lt]: new Date() } } }
  );
  return count;
}

let intervalHandle = null;

function start(intervalMs) {
  if (intervalHandle) return;
  intervalHandle = setInterval(() => {
    checkOverdueInvoices().catch((err) => console.error('Push poller error:', err.message));
  }, intervalMs);
  intervalHandle.unref();
}

function stop() {
  if (intervalHandle) clearInterval(intervalHandle);
  intervalHandle = null;
}

module.exports = { checkOverdueInvoices, resetOverdueNotifications, start, stop };
