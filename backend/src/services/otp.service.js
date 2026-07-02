const otpStore = new Map();

function generateOtp(target) {
  const kode = String(Math.floor(100000 + Math.random() * 900000));
  const expiresMinutes = Number(process.env.OTP_EXPIRES_MINUTES || 5);
  const expired_at = new Date(Date.now() + expiresMinutes * 60 * 1000);

  otpStore.set(target, { kode, expired_at, is_used: false });

  return { kode, expired_at };
}

function verifyOtp(target, kode) {
  const entry = otpStore.get(target);

  if (!entry) return false;
  if (entry.is_used) return false;
  if (entry.expired_at < new Date()) return false;
  if (entry.kode !== kode) return false;

  entry.is_used = true;
  return true;
}

module.exports = { generateOtp, verifyOtp };
