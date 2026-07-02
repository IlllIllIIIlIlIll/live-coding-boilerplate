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

## Catatan

- Styling hanya lewat satu file `frontend/src/index.css` (global) — tidak ada CSS
  Modules / styled-components / file CSS per komponen.
- Komponen di `frontend/src/components` (`Button`, `Input`, `Card`, `DataTable`,
  `Modal`, `EntityForm`) dipakai ulang di semua halaman (Unit, Tagihan, Pemilik).
- Jangan commit file `.env` (sudah masuk `.gitignore`) — gunakan `.env.example`
  sebagai referensi.

## Submission

Push project ini ke repository GitHub, lalu bagikan link repo-nya ke interviewer.
