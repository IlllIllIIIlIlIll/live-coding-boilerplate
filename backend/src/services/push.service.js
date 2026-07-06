const webpush = require('web-push');
const { User } = require('../models');

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:admin@example.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Kirim push notification ke sekumpulan user yang sudah subscribe. Subscription
// yang sudah tidak valid (404/410 dari push service) otomatis dibersihkan.
async function sendToUsers(users, payload) {
  const results = [];

  for (const user of users) {
    if (!user.push_subscription) continue;

    try {
      await webpush.sendNotification(user.push_subscription, JSON.stringify(payload));
      results.push({ userId: user.id, ok: true });
    } catch (err) {
      console.error(`Push gagal untuk user ${user.id} (${err.statusCode || 'no status'}):`, err.message);
      if (err.statusCode === 404 || err.statusCode === 410) {
        user.push_subscription = null;
        await user.save();
      }
      results.push({ userId: user.id, ok: false, error: err.message });
    }
  }

  return results;
}

async function sendToAdmins(payload) {
  const admins = await User.findAll({ where: { role: 'admin' } });
  return sendToUsers(admins, payload);
}

module.exports = { sendToUsers, sendToAdmins };
