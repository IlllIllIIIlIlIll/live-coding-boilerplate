const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// TODO: definisikan field sesuai SPEC.md bagian 4, tabel `units`:
// id (PK, auto increment), nama_unit, alamat, pemilik_id (FK -> users.id), status (enum aktif/nonaktif)
const Unit = sequelize.define(
  'Unit',
  {
    // TODO: isi definisi kolom di sini
  },
  {
    tableName: 'units',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = Unit;
