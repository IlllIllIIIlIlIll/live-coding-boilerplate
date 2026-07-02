/**
 * TODO: implementasikan komponen input reusable dengan label & pesan error,
 * dipakai ulang di form Login, Unit, Tagihan, Pemilik.
 * Gunakan class .form-group, .form-label, .input, .error-text dari index.css.
 */
export default function Input({ label, error, ...props }) {
  return <input {...props} />;
}
