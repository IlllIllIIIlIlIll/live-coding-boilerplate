const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// TODO: definisikan field sesuai SPEC.md bagian 4, tabel `invoices` (tagihan):
// id (PK, auto increment), unit_id (FK -> units.id), periode (YYYY-MM), jumlah (decimal),
// status (enum belum_bayar/lunas), jatuh_tempo (date), tanggal_bayar (date, nullable)
const Tagihan = sequelize.define(
  'Tagihan',
  {
    // TODO: isi definisi kolom di sini
  },
  {
    tableName: 'invoices', // nama tabel di DB "invoices" (model/JS tetap disebut Tagihan)
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = Tagihan;
