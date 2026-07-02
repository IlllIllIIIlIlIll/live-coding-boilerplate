const sequelize = require('../config/database');
const User = require('./user.model');
const Unit = require('./unit.model');
const Tagihan = require('./tagihan.model');

User.hasMany(Unit, { foreignKey: 'pemilik_id', as: 'units' });
Unit.belongsTo(User, { foreignKey: 'pemilik_id', as: 'pemilik' });

Unit.hasMany(Tagihan, { foreignKey: 'unit_id', as: 'tagihan' });
Tagihan.belongsTo(Unit, { foreignKey: 'unit_id', as: 'unit' });

module.exports = {
  sequelize,
  User,
  Unit,
  Tagihan,
};
