# Spesifikasi Tes Live Coding — Aplikasi Web Member

**Durasi:** 4–6 jam (onsite)
**Stack:** Node.js + Express (backend), React (frontend), MySQL (database), Sequelize (ORM)
**Arsitektur:** MVC pada backend dan frontend

---

## 1. Tujuan Tes

Menilai kemampuan kandidat membangun aplikasi web full-stack dengan struktur MVC yang rapi, mencakup: pemodelan data relasional, REST API, autentikasi multi-metode, role-based access control, dan integrasi frontend React ke backend Express.

---

## 2. Studi Kasus

Aplikasi web manajemen member (misalnya untuk pengelolaan unit properti/apartemen). Ada tiga entitas utama:

| Entitas | Deskripsi |
|---|---|
| **User** | Akun login, punya role `admin` atau `pemilik` |
| **Unit** | Unit properti yang dimiliki oleh seorang pemilik |
| **Tagihan** | Tagihan yang terikat pada sebuah unit |

### Hak akses (Role Based Access Control)

| Aksi | Admin | Pemilik |
|---|---|---|
| CRUD data Pemilik | Ya | Tidak |
| CRUD Unit | Ya | Tidak |
| CRUD Tagihan | Ya | Tidak |
| Lihat Unit | Ya (semua) | Ya (miliknya saja) |
| Lihat Tagihan | Ya (semua) | Ya (miliknya saja) |

Catatan: Pemilik hanya boleh melihat (read-only) unit dan tagihan miliknya sendiri — bukan milik pemilik lain. Ini harus ditegakkan di level controller/middleware, bukan hanya disembunyikan di UI.

---

## 3. Arsitektur MVC

### Backend (Express)
- **Model**: representasi tabel menggunakan **Sequelize** (definisi schema via `sequelize.define`/class model, termasuk asosiasi `belongsTo`/`hasMany`).
- **Controller**: logika bisnis (validasi, otorisasi, pemanggilan model).
- **View**: karena ini API, "view" berupa **endpoint REST** yang mengembalikan JSON (bukan template HTML).
- **Route** memetakan endpoint ke controller (boleh dianggap bagian dari layer View/routing).
- **Middleware**: autentikasi (verifikasi token), otorisasi (cek role), error handler terpusat.

Struktur folder yang diharapkan (indikatif, boleh disesuaikan):
```
backend/
  src/
    models/           (Sequelize model + index.js untuk asosiasi)
    controllers/
    routes/
    middlewares/
    services/         (opsional: OTP, Google OAuth, dsb)
    config/
      database.js     (konfigurasi koneksi Sequelize)
    migrations/        (Sequelize CLI, jika dipakai)
    app.js / server.js
```

### Frontend (React)
- **Model**: state/data dari API (bisa berupa hooks/service layer yang fetch data, atau state management seperti Context/Redux).
- **Controller**: logika di dalam komponen/hooks yang mengatur alur data (fetch, submit, validasi form).
- **View**: komponen React (JSX) yang menampilkan UI.

Struktur folder indikatif:
```
frontend/
  src/
    pages/            (Login, Dashboard, Unit, Tagihan, Pemilik)
    components/       (komponen reusable: Button, Input, Table/List, Card, dst — dipakai lintas halaman)
    services/         (api client, axios instance)
    contexts/ atau store/
    routes/           (protected route berdasarkan role)
    index.css         (satu-satunya file CSS, global)
    index.js          (import index.css di sini)
```

---

## 4. Skema Database (MySQL)

### Tabel `users`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | INT, PK, AUTO_INCREMENT | |
| nama | VARCHAR(100) | |
| email | VARCHAR(100), UNIQUE, NULLABLE | wajib ada salah satu dari email/no_hp |
| no_hp | VARCHAR(20), UNIQUE, NULLABLE | |
| password | VARCHAR(255), NULLABLE | hashed (bcrypt), null jika hanya login via OTP/Google |
| google_id | VARCHAR(100), NULLABLE, UNIQUE | diisi jika login via Google |
| role | ENUM('admin','pemilik') | |
| created_at, updated_at | DATETIME | |

### Tabel `units`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | INT, PK, AUTO_INCREMENT | |
| nama_unit | VARCHAR(50) | contoh: "A-12" |
| alamat | VARCHAR(255) | |
| pemilik_id | INT, FK → users.id | wajib role pemilik |
| status | ENUM('aktif','nonaktif') | |
| created_at, updated_at | DATETIME | |

### Tabel `invoices` (tagihan)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | INT, PK, AUTO_INCREMENT | |
| unit_id | INT, FK → units.id | |
| periode | VARCHAR(7) | format `YYYY-MM` |
| jumlah | DECIMAL(12,2) | |
| status | ENUM('belum_bayar','lunas') | |
| jatuh_tempo | DATE | |
| tanggal_bayar | DATE, NULLABLE | |
| created_at, updated_at | DATETIME | |

### Relasi
- `users` (role pemilik) 1 — N `units`
- `units` 1 — N `invoices`

### Tabel tambahan untuk OTP (opsional, bisa juga di-cache di memori/Redis untuk tes)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | INT, PK | |
| target | VARCHAR(100) | email atau no_hp |
| kode_otp | VARCHAR(6) | |
| expired_at | DATETIME | |
| is_used | BOOLEAN | |

---

## 5. Autentikasi — 3 Metode Login

Semua metode login berujung pada penerbitan **JWT** (access token) yang dipakai untuk request selanjutnya via header `Authorization: Bearer <token>`.

### (1) Email + OTP
1. `POST /api/auth/otp/request` — body `{ target }` (email) → generate kode OTP (6 digit), simpan dengan masa berlaku (misal 5 menit). Untuk kebutuhan tes, OTP cukup dikembalikan di response/log (tidak perlu email gateway asli).
2. `POST /api/auth/otp/verify` — body `{ target, kode_otp }` → jika valid & belum expired, cari/buat user, terbitkan JWT.

### (2) No HP/Email + Password
- `POST /api/auth/login` — body `{ identifier, password }` di mana `identifier` bisa email atau no_hp. Verifikasi dengan bcrypt, terbitkan JWT.

### (3) Integrasi Google Login
- `GET /api/auth/google` — redirect ke consent screen Google (misal via `passport-google-oauth20`).
- `GET /api/auth/google/callback` — terima profile dari Google, cari user berdasarkan `google_id`/email; jika belum ada, buat user baru dengan role default (`pemilik`); terbitkan JWT dan redirect ke frontend dengan token.

### Ketentuan umum
- Setiap user boleh punya kombinasi identitas (email, no_hp, google_id) — tidak wajib semua ada, tapi minimal satu.
- Registrasi user baru dari sisi publik **tidak diperlukan**: hanya admin yang boleh membuat akun pemilik (lihat endpoint CRUD Pemilik). Login OTP/Google untuk pemilik yang datanya belum ada boleh menolak login (403) atau membuat entri baru — kandidat boleh memilih pendekatan, asalkan konsisten dan dijelaskan.
- Middleware `authMiddleware` memverifikasi JWT dan menempelkan `req.user`.
- Middleware `roleMiddleware(['admin'])` mengecek otorisasi berbasis role.

---

## 6. Daftar Endpoint API

### Auth
| Method | Endpoint | Akses |
|---|---|---|
| POST | /api/auth/otp/request | Publik |
| POST | /api/auth/otp/verify | Publik |
| POST | /api/auth/login | Publik |
| GET | /api/auth/google | Publik |
| GET | /api/auth/google/callback | Publik |
| GET | /api/auth/me | Terautentikasi |

### Pemilik (CRUD — Admin only)
| Method | Endpoint | Akses |
|---|---|---|
| GET | /api/pemilik | Admin |
| GET | /api/pemilik/:id | Admin |
| POST | /api/pemilik | Admin |
| PUT | /api/pemilik/:id | Admin |
| DELETE | /api/pemilik/:id | Admin |

### Unit
| Method | Endpoint | Akses |
|---|---|---|
| GET | /api/units | Admin (semua) / Pemilik (miliknya) |
| GET | /api/units/:id | Admin (semua) / Pemilik (miliknya) |
| POST | /api/units | Admin |
| PUT | /api/units/:id | Admin |
| DELETE | /api/units/:id | Admin |

### Tagihan
| Method | Endpoint | Akses |
|---|---|---|
| GET | /api/tagihan | Admin (semua) / Pemilik (miliknya) |
| GET | /api/tagihan/:id | Admin (semua) / Pemilik (miliknya) |
| POST | /api/tagihan | Admin |
| PUT | /api/tagihan/:id | Admin |
| DELETE | /api/tagihan/:id | Admin |

---

## 7. Kebutuhan Frontend (React)

### Halaman
- `Login` — mendukung 3 metode (tab/opsi: OTP email, password (email/no HP), tombol "Login dengan Google").
- `Dashboard` — ringkasan sesuai role.
- `Pemilik` (list, tambah, edit, hapus) — hanya untuk admin.
- `Unit` (list, tambah, edit, hapus untuk admin; list read-only untuk pemilik).
- `Tagihan` (list, tambah, edit, hapus untuk admin; list read-only untuk pemilik).

### Kebutuhan teknis
- Routing dengan `react-router-dom`, termasuk **protected route** berbasis role (redirect ke login jika token tidak ada/invalid; redirect/403 jika role tidak sesuai).
- Penyimpanan token (misal di memory + refresh via context, atau localStorage — sebutkan trade-off keamanannya jika ditanya).
- Axios/fetch instance dengan interceptor untuk menyisipkan `Authorization` header.
- Form validasi dasar di sisi client.
- **Styling**: hanya menggunakan satu file `index.css` global (tidak boleh CSS Modules, styled-components, atau file CSS per komponen). Semua class ditulis di `src/index.css` dan diimport sekali di entry point.
- **Reuse komponen**: komponen UI (form input, tombol, tabel/list, card) harus dibuat generik dan dipakai ulang di berbagai halaman (Unit, Tagihan, Pemilik) — bukan komponen terpisah yang isinya duplikat untuk tiap entitas. Ini jadi salah satu poin penilaian struktur kode frontend.

---

## 8. Tahapan & Alokasi Waktu (4–6 jam onsite)

Dengan waktu yang lebih longgar, kandidat diharapkan menyelesaikan seluruh bagian **Wajib** — termasuk ketiga metode login dan form tambah/edit di frontend (bukan cuma list) — lalu mengerjakan **Bonus** jika waktu tersisa.

### Wajib (± 3.5–4.5 jam)
1. Setup project + skema database + model **Sequelize** (termasuk asosiasi) untuk User, Unit, Tagihan/Invoice. *(~30 menit)*
2. Autentikasi 3 metode: Email + OTP, No HP/Email + Password, dan Google OAuth. *(~75–90 menit)*
3. Middleware auth + role-based access control. *(~20 menit)*
4. CRUD lengkap Unit dan Tagihan (backend + frontend, termasuk form tambah/edit) dengan aturan akses admin vs pemilik. *(~90 menit)*
5. CRUD Pemilik dari sisi admin (backend + frontend). *(~45 menit)*
6. Frontend: seluruh halaman terhubung API, protected route berbasis role, komponen reusable. *(~30 menit)*

### Bonus (jika waktu tersisa)
- Validasi/error handling yang lebih lengkap, pagination, atau pencarian/filter.
- Ringkasan statistik di Dashboard (jumlah unit, total tagihan belum bayar, dsb).
- Unit test dasar untuk salah satu endpoint.

### Demo & wawancara (± 20–30 menit di akhir)
- Kandidat mendemokan fitur yang berhasil dibuat.
- Interviewer bertanya seputar keputusan desain: kenapa struktur folder begitu, bagaimana menangani keamanan password/OTP/JWT, bagaimana skalanya jika data besar, dsb.

---

## 9. Kriteria Penilaian

| Aspek | Bobot | Indikator |
|---|---|---|
| Struktur MVC & organisasi kode | 20% | Pemisahan model/controller/route jelas, tidak ada logic bisnis di route |
| Kebenaran fungsional | 25% | CRUD & login bekerja sesuai spesifikasi role |
| Keamanan | 20% | Password di-hash, JWT diverifikasi, OTP punya masa berlaku, tidak ada data sensitif bocor di response |
| Desain API & data | 15% | Endpoint RESTful konsisten, skema relasi benar, validasi input ada |
| Kualitas frontend | 10% | Komponen reusable (tidak duplikat antar halaman), hanya satu `index.css`, protected route bekerja, state dikelola rapi |
| Komunikasi & problem solving | 10% | Mampu menjelaskan keputusan desain, responsif terhadap masukan interviewer |

---

## 10. Yang Disediakan ke Kandidat

- Starter repo (folder ini) berisi skeleton kosong: struktur folder, dependencies, koneksi server & database sudah jalan, tapi model/controller/middleware/halaman React masih TODO.
- Akses MySQL lokal (kredensial/connection string).
- Dokumen spesifikasi ini.
- Kredensial Google OAuth Client ID/Secret jika bagian Google login ingin dinilai (bisa disiapkan panitia agar kandidat tidak perlu bikin sendiri).

## 11. Yang Dikumpulkan/Dinilai di Akhir Sesi

- Kode di-push ke repository **GitHub** (bisa fork dari starter repo panitia, atau repo baru yang linknya dibagikan ke interviewer), dengan commit history sepanjang sesi (bukan satu commit besar di akhir).
- README singkat: cara menjalankan backend & frontend, environment variable yang dipakai.
- Demo langsung di depan interviewer.
