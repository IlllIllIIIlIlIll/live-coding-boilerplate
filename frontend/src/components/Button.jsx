/**
 * TODO: implementasikan komponen tombol reusable.
 * Harus dipakai ulang di semua halaman (Login, Unit, Tagihan, Pemilik) — jangan
 * bikin tombol terpisah per halaman.
 * Saran: terima prop `variant` ('primary' | 'secondary' | 'danger') dan gunakan
 * class dari index.css (.btn, .btn-primary, dst).
 */
export default function Button({ children, ...props }) {
  return (
    <button {...props}>{children}</button>
  );
}
