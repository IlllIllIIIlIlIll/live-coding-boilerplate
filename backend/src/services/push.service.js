const webpush = require('web-push');
const { User } = require('../models');
const { initFirebaseAdmin } = require('../config/firebaseAdmin');

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:admin@example.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Kirim push lewat FCM ke aplikasi Android native (WebView + FirebaseMessagingService).
// Kalau Firebase Admin belum dikonfigurasi (FIREBASE_SERVICE_ACCOUNT_JSON kosong),
// dilewati tanpa error — Web Push tetap jalan seperti biasa.
async function sendFcm(user, payload) {
  const admin = initFirebaseAdmin();
  if (!admin || !user.fcm_token) return null;

  try {
    await admin.messaging().send({
      token: user.fcm_token,
      notification: { title: payload.title, body: payload.body },
      data: payload.data
        ? Object.fromEntries(Object.entries(payload.data).map(([k, v]) => [k, String(v)]))
        : undefined,
    });
    return { userId: user.id, channel: 'fcm', ok: true };
  } catch (err) {
    console.error(`FCM push gagal untuk user ${user.id}:`, err.message);
    if (err.code === 'messaging/registration-token-not-registered') {
      user.fcm_token = null;
      await user.save();
    }
    return { userId: user.id, channel: 'fcm', ok: false, error: err.message };
  }
}

// Kirim push notification ke sekumpulan user yang sudah subscribe, lewat Web
// Push (browser) dan/atau FCM (Android native) tergantung mana yang mereka
// punya. Subscription/token yang sudah tidak valid otomatis dibersihkan.
async function sendToUsers(users, payload) {
  const results = [];

  for (const user of users) {
    if (user.push_subscription) {
      try {
        await webpush.sendNotification(user.push_subscription, JSON.stringify(payload));
        results.push({ userId: user.id, channel: 'webpush', ok: true });
      } catch (err) {
        console.error(`Web Push gagal untuk user ${user.id} (${err.statusCode || 'no status'}):`, err.message);
        if (err.statusCode === 404 || err.statusCode === 410) {
          user.push_subscription = null;
          await user.save();
        }
        results.push({ userId: user.id, channel: 'webpush', ok: false, error: err.message });
      }
    }

    const fcmResult = await sendFcm(user, payload);
    if (fcmResult) results.push(fcmResult);
  }

  return results;
}

async function sendToAdmins(payload) {
  const admins = await User.findAll({ where: { role: 'admin' } });
  return sendToUsers(admins, payload);
}

module.exports = { sendToUsers, sendToAdmins };
