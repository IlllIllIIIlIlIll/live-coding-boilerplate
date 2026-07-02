# Tes Live Coding — Aplikasi Web Member (Starter Kosong)

Ini adalah **starter kosong** untuk kandidat tes live coding. Detail requirement lengkap ada di [SPEC.md](./SPEC.md).

Yang sudah disiapkan (infrastruktur/plumbing): struktur folder, `package.json` & dependencies, koneksi Express ↔ MySQL, wiring routing (backend & frontend), axios instance, dan styling dasar (`index.css`).

Yang **belum** diisi dan jadi tugas kandidat (ditandai komentar `TODO` di kode): definisi kolom & asosiasi model Sequelize, logic auth (JWT, OTP, password), middleware auth & role, CRUD controller Pemilik/Unit/Tagihan, serta halaman & komponen React (Login, Dashboard, Unit, Tagihan, Pemilik, Button, Input, Card, DataTable, AuthContext, ProtectedRoute).

## Struktur

```
tes-live-coding/
  SPEC.md          spesifikasi lengkap
  backend/         Express + Sequelize (MySQL), MVC — logic masih TODO
  frontend/        React + Vite, MVC — logic masih TODO
```

## Menjalankan Backend

```
cd backend
npm install
cp .env.example .env   # isi kredensial database MySQL & JWT secret kamu
npm run dev
```

Backend akan menyala di `http://localhost:5000` dan berhasil konek ke MySQL (pastikan database `DB_NAME` di `.env` sudah dibuat), tapi semua endpoint masih membalas `501 Belum diimplementasikan` sampai kamu isi logic-nya.

## Menjalankan Frontend

```
cd frontend
npm install
cp .env.example .env   # sesuaikan VITE_API_URL jika perlu
npm run dev
```

Frontend berjalan di `http://localhost:5173`, tapi tiap halaman masih menampilkan placeholder "TODO" sampai diimplementasikan.

## Catatan

- Styling hanya lewat satu file `frontend/src/index.css` (global) — sudah ada beberapa class siap pakai (`.btn`, `.card`, `.input`, `.data-table`, dst), jangan bikin file CSS lain.
- Komponen di `frontend/src/components` (`Button`, `Input`, `Card`, `DataTable`) wajib dipakai ulang di semua halaman — jangan bikin versi terpisah per halaman.
- Jangan commit file `.env` (sudah masuk `.gitignore`) — gunakan `.env.example` sebagai referensi.

## Submission

Push project ini ke repository GitHub kamu sendiri, lalu bagikan link repo-nya ke interviewer.
