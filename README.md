# Aplikasi Web Member — Manajemen Unit & Tagihan

Aplikasi web manajemen member (unit properti/apartemen) dengan role-based access
control (admin vs pemilik), 3 metode login, dan CRUD Pemilik/Unit/Tagihan.
Detail spesifikasi lengkap ada di [SPEC.md](./SPEC.md).

**Stack:** Node.js + Express + Sequelize (MySQL) di backend, React + Vite di frontend.

## Struktur

```
backend/         Express + Sequelize (MySQL), MVC
  src/
    models/       User, Unit, Tagihan (invoices) + asosiasi
    controllers/  auth, pemilik, unit, tagihan
    routes/
    middlewares/  auth (JWT), role (RBAC), error handler
    services/     otp.service.js (OTP in-memory)
    config/       database.js, passport.js (Google OAuth)
    seed.js       data contoh (admin, pemilik, unit, tagihan)
frontend/        React + Vite, MVC
  src/
    pages/        Login, Dashboard, Unit, Tagihan, Pemilik
    components/   Button, Input, Card, DataTable, Modal, EntityForm (reusable)
    contexts/      AuthContext
    routes/        ProtectedRoute (role-based)
    services/      api.js (axios instance + interceptors)
    index.css      satu-satunya file CSS
```

## Menjalankan Backend

```
cd backend
npm install
cp .env.example .env   # HANYA jika backend/.env belum ada — cp akan menimpa isi
                        # yang sudah dikonfigurasi jika filenya sudah ada!
npm run dev
```

Lalu isi `backend/.env` dengan kredensial database MySQL, JWT secret, dan Google
OAuth. Setelah mengubah `.env`, restart `npm run dev` secara manual — nodemon
hanya mem-watch file `.js/.mjs/.cjs/.json`, bukan `.env`.

Pastikan database MySQL (`DB_NAME` di `.env`) sudah dibuat sebelum start (Sequelize
akan sync skema otomatis lewat `sequelize.sync({ alter: true })`).

Isi database dengan data contoh (opsional tapi disarankan untuk testing):

```
npm run seed
```

Ini membuat:
| Email/No HP | Password | Role | Catatan |
|---|---|---|---|
| admin@example.com | admin123 | admin | |
| izza.diasputra10@gmail.com | admin123 | admin | akun Google asli, untuk tes login Google OAuth |
| budi@example.com / 081234567890 | pemilik123 | pemilik | punya unit A-12 |
| siti@example.com / 081298765432 | pemilik123 | pemilik | punya unit B-05 |
| 18222070@std.stei.itb.ac.id | pemilik123 | pemilik | punya unit C-01 |

Backend menyala di `http://localhost:5000`.

Menjalankan test (jest + supertest, meng-hit `/api/auth/login` dan `/api/auth/me`
terhadap database yang sudah di-seed di atas):

```
npm test
```

## Menjalankan Frontend

```
cd frontend
npm install
cp .env.example .env   # sesuaikan VITE_API_URL jika perlu
npm run dev
```

Frontend berjalan di `http://localhost:5173`.

## Environment Variables

### `backend/.env`
| Variabel | Keterangan |
|---|---|
| `PORT` | Port server Express (default 5000) |
| `FRONTEND_URL` | Dipakai untuk CORS dan redirect callback Google OAuth |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Koneksi MySQL |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | Signing secret & masa berlaku token JWT |
| `OTP_EXPIRES_MINUTES` | Masa berlaku kode OTP |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` | Kredensial dari Google Cloud Console (OAuth Client ID) |
| `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` | Keypair untuk Web Push (generate: `node -e "console.log(require('web-push').generateVAPIDKeys())"`) |
| `PUSH_POLL_INTERVAL_MS` | Interval polling tagihan jatuh tempo untuk push notification (default 60000) |

### `frontend/.env`
| Variabel | Keterangan |
|---|---|
| `VITE_API_URL` | Base URL API backend (default `http://localhost:5000/api`) |

## Keputusan Desain

- **OTP untuk email yang belum terdaftar → ditolak (403).** Registrasi publik tidak
  tersedia (hanya admin yang boleh membuat akun pemilik), jadi OTP tidak
  auto-membuat user baru.
- **Google login untuk email yang belum terdaftar → auto-membuat user baru** dengan
  role `pemilik` (sesuai SPEC §5.3, eksplisit berbeda dari kebijakan OTP di atas —
  SPEC mengizinkan kandidat memilih pendekatan berbeda per metode selama konsisten
  dan dijelaskan).
- **Token disimpan di `localStorage`** (bukan in-memory/httpOnly cookie). Trade-off:
  lebih rentan terhadap XSS dibanding httpOnly cookie, tapi lebih sederhana untuk
  aplikasi tes ini dan tidak butuh proxy/same-site cookie setup. Untuk produksi,
  httpOnly cookie + refresh token lebih aman.
- **RBAC ditegakkan di controller/middleware**, bukan hanya di UI — pemilik hanya
  bisa melihat unit/tagihan miliknya sendiri walau endpoint diakses langsung
  (lihat `unit.controller.js` / `tagihan.controller.js`, scoping berdasarkan
  `req.user`).
- **Password di-hash dengan bcrypt**, tidak pernah dikembalikan di response API.
- **Foreign key `pemilik_id`/`unit_id` menggunakan `ON DELETE RESTRICT`** (bukan
  default Sequelize yang CASCADE) — menghapus pemilik/unit yang masih punya
  unit/tagihan akan ditolak (400), bukan menghapus data terkait secara diam-diam.

## Fitur Bonus

- **Pencarian & filter** di halaman Unit, Tagihan (+ filter status), dan Pemilik —
  client-side, langsung di atas data yang sudah difilter backend sesuai role.
- **Ringkasan statistik di Dashboard** sesuai role (lihat `Dashboard.jsx`).
- **Test dasar** untuk endpoint auth (`backend/tests/auth.test.js`).
- **Push notification untuk admin dan pemilik** saat ada tagihan belum bayar yang
  lewat jatuh tempo — pakai Web Push (browser push, bukan aplikasi native), lihat
  bagian di bawah.

### Push Notification (Tagihan Jatuh Tempo)

Admin **dan** pemilik bisa mengaktifkan notifikasi push dari kartu "Notifikasi
Push" di Dashboard (kartu ini muncul untuk kedua role, dengan teks yang
disesuaikan). Backend menjalankan poller (`services/pushPoller.service.js`,
interval `PUSH_POLL_INTERVAL_MS`) yang mencari tagihan `belum_bayar` dengan
`jatuh_tempo` yang sudah lewat dan `notified_at` masih `NULL`, lalu mengirim push
via `web-push` (VAPID) ke:
- **semua admin** yang sudah subscribe (notifikasi mencakup semua tagihan, lintas
  unit/pemilik), dan
- **pemilik pemilik unit tersebut** secara spesifik (notifikasi hanya tentang
  tagihannya sendiri, dengan teks berbeda: "Tagihan Anda Jatuh Tempo").

Setelah dikirim, `notified_at` ditandai supaya tidak mengirim ulang di siklus
poller berikutnya.

**Cara tes manual (sesuai skenario "trigger dari DB"):**

Sekali saja per tagihan, buat dulu tagihan yang overdue:

```
cd backend
npm run reset-notif -- <id_tagihan> --overdue
```

(atau langsung lewat SQL: `UPDATE invoices SET jatuh_tempo = '2020-01-01', status =
'belum_bayar', notified_at = NULL WHERE id = <id_tagihan>;`)

Setelah itu, tombol **"Reset & Kirim Ulang (demo)"** di Dashboard sudah cukup
untuk memicu ulang tagihan yang sama berkali-kali — tombol ini (dan endpoint
`POST /api/push/check-now` di baliknya) selalu me-reset `notified_at` semua
tagihan yang sedang overdue+belum_bayar dulu sebelum mengirim, jadi tidak akan
pernah melaporkan "0 tagihan dinotifikasi" selama masih ada tagihan yang
overdue. Notifikasi akan muncul sebagai push notification asli dari browser
(bukan simulasi/toast in-app).

**Catatan platform:**
- **Android (Chrome/Edge/Firefox):** langsung bekerja, browser tidak perlu
  sedang dibuka.
- **iPhone (Safari):** hanya bekerja jika situs sudah di-*Add to Home Screen*
  (iOS 16.4+) — Safari tidak mengirim push ke tab biasa, ini pembatasan dari
  iOS sendiri.
- **Testing dengan Playwright/Chromium:** subscription Push API **tidak berhasil**
  di context incognito (dibatasi Chrome secara sengaja) maupun di build Chromium
  bawaan Playwright (tidak ada API key Google untuk push service) — perlu
  `launchPersistentContext` + `channel: 'chrome'` (Chrome asli) untuk pengujian
  end-to-end yang sesungguhnya.

## Catatan

- Styling hanya lewat satu file `frontend/src/index.css` (global) — tidak ada CSS
  Modules / styled-components / file CSS per komponen.
- Komponen di `frontend/src/components` (`Button`, `Input`, `Card`, `DataTable`,
  `Modal`, `EntityForm`) dipakai ulang di semua halaman (Unit, Tagihan, Pemilik).
- Jangan commit file `.env` (sudah masuk `.gitignore`) — gunakan `.env.example`
  sebagai referensi.

## Submission

Push project ini ke repository GitHub, lalu bagikan link repo-nya ke interviewer.
