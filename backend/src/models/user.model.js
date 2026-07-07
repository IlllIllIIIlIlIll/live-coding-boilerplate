const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nama: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      unique: 'users_email_unique',
      allowNull: true,
    },
    no_hp: {
      type: DataTypes.STRING(20),
      unique: 'users_no_hp_unique',
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    google_id: {
      type: DataTypes.STRING(100),
      unique: 'users_google_id_unique',
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM('admin', 'pemilik'),
      allowNull: false,
    },
    push_subscription: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    fcm_token: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
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
