const admin = require('firebase-admin');

let initialized = false;
let warned = false;

// Inisialisasi Firebase Admin SDK secara lazy, hanya kalau kredensial sudah
// disediakan lewat FIREBASE_SERVICE_ACCOUNT_JSON. Kalau belum ada, fitur FCM
// (push ke aplikasi Android native) otomatis dilewati tanpa mematikan Web Push.
function initFirebaseAdmin() {
  if (initialized) return admin;

  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    if (!warned) {
      console.warn(
        'FIREBASE_SERVICE_ACCOUNT_JSON belum diset — notifikasi FCM (Android native) dinonaktifkan, Web Push tetap berjalan normal.'
      );
      warned = true;
    }
    return null;
  }

  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    admin.initializeApp({ credential: admin.cert(serviceAccount) });
    initialized = true;
    return admin;
  } catch (err) {
    console.error('Gagal inisialisasi Firebase Admin:', err.message);
    return null;
  }
}

module.exports = { initFirebaseAdmin };
