const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Unit = sequelize.define(
  'Unit',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nama_unit: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    alamat: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    pemilik_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    status: {
      type: DataTypes.ENUM('aktif', 'nonaktif'),
      allowNull: false,
      defaultValue: 'aktif',
    },
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
