/**
 * TODO: implementasikan OTP service sesuai SPEC.md bagian 5.
 * Boleh in-memory (Map) untuk kebutuhan tes, atau tabel DB terpisah.
 *
 * generateOtp(target): buat kode 6 digit, simpan dengan masa berlaku
 *   (env OTP_EXPIRES_MINUTES), lalu kembalikan/cetak kodenya (tidak perlu SMS/email asli).
 * verifyOtp(target, kode): true jika kode cocok & belum kedaluwarsa, lalu one-time use.
 */

function generateOtp(target) {
  throw new Error('generateOtp belum diimplementasikan');
}

function verifyOtp(target, kode) {
  throw new Error('verifyOtp belum diimplementasikan');
}

module.exports = { generateOtp, verifyOtp };
