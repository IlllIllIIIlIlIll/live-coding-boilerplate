const sequelize = require('../config/database');
const User = require('./user.model');
const Unit = require('./unit.model');
const Tagihan = require('./tagihan.model');

// TODO: definisikan asosiasi antar model sesuai SPEC.md bagian 4 (Relasi):
// - User (role pemilik) 1 - N Unit  (foreign key: units.pemilik_id)
// - Unit 1 - N Tagihan/invoices     (foreign key: invoices.unit_id)
//
// Contoh pola (lengkapi sendiri):
// User.hasMany(Unit, { foreignKey: 'pemilik_id', as: 'units' });
// Unit.belongsTo(User, { foreignKey: 'pemilik_id', as: 'pemilik' });

module.exports = {
  sequelize,
  User,
  Unit,
  Tagihan,
};
