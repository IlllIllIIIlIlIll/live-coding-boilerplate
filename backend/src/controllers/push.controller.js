const { checkOverdueInvoices, resetOverdueNotifications } = require('../services/pushPoller.service');

// GET /api/push/vapid-public-key
function getVapidPublicKey(req, res) {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
}

// POST /api/push/subscribe  { subscription }
async function subscribe(req, res, next) {
  try {
    const { subscription } = req.body;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ message: 'subscription tidak valid' });
    }

    req.user.push_subscription = subscription;
    await req.user.save();

    res.status(201).json({ message: 'Berhasil subscribe notifikasi push' });
  } catch (err) {
    next(err);
  }
}

// POST /api/push/unsubscribe
async function unsubscribe(req, res, next) {
  try {
    req.user.push_subscription = null;
    await req.user.save();
    res.json({ message: 'Berhasil unsubscribe notifikasi push' });
  } catch (err) {
    next(err);
  }
}

// POST /api/push/register-fcm-token  { fcmToken }
// Dipanggil oleh aplikasi Android native (WebView) — JWT diambil dari
// localStorage WebView, token FCM didapat dari Firebase, keduanya dikirim ke
// sini supaya backend tahu token FCM ini milik user mana.
async function registerFcmToken(req, res, next) {
  try {
    const { fcmToken } = req.body;

    if (!fcmToken) {
      return res.status(400).json({ message: 'fcmToken tidak valid' });
    }

    req.user.fcm_token = fcmToken;
    await req.user.save();

    res.status(201).json({ message: 'Berhasil mendaftarkan token FCM' });
  } catch (err) {
    next(err);
  }
}

// POST /api/push/check-now — debug/demo: reset notified_at pada semua tagihan
// overdue+belum_bayar lalu langsung cek & kirim, tanpa menunggu poller dan tanpa
// perlu reset manual lewat SQL/script terpisah tiap kali diulang.
async function checkNow(req, res, next) {
  try {
    await resetOverdueNotifications();
    const notified = await checkOverdueInvoices();
    res.json({ message: `Cek selesai, ${notified.length} tagihan dinotifikasi`, notified });
  } catch (err) {
    next(err);
  }
}

module.exports = { getVapidPublicKey, subscribe, unsubscribe, registerFcmToken, checkNow };
