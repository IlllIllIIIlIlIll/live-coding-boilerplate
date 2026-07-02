const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Tagihan = sequelize.define(
  'Tagihan',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    unit_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'units',
        key: 'id',
      },
    },
    periode: {
      type: DataTypes.STRING(7),
      allowNull: false,
      validate: {
        is: /^\d{4}-(0[1-9]|1[0-2])$/,
      },
    },
    jumlah: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('belum_bayar', 'lunas'),
      allowNull: false,
      defaultValue: 'belum_bayar',
    },
    jatuh_tempo: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    tanggal_bayar: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
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
