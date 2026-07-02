const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// TODO: definisikan field sesuai SPEC.md bagian 4, tabel `users`:
// id (PK, auto increment), nama, email (unique, nullable), no_hp (unique, nullable),
// password (nullable, hashed), google_id (unique, nullable), role (enum admin/pemilik)
const User = sequelize.define(
  'User',
  {
    // TODO: isi definisi kolom di sini
  },
  {
    tableName: 'users',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = User;
