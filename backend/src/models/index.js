const sequelize = require('../config/database');
const User = require('./user.model');
const Unit = require('./unit.model');
const Tagihan = require('./tagihan.model');

// onDelete: 'RESTRICT' eksplisit — default Sequelize adalah CASCADE untuk FK NOT NULL,
// yang akan menghapus unit/tagihan secara diam-diam saat pemilik/unit dihapus.
User.hasMany(Unit, { foreignKey: 'pemilik_id', as: 'units', onDelete: 'RESTRICT' });
Unit.belongsTo(User, { foreignKey: 'pemilik_id', as: 'pemilik' });

Unit.hasMany(Tagihan, { foreignKey: 'unit_id', as: 'tagihan', onDelete: 'RESTRICT' });
Tagihan.belongsTo(Unit, { foreignKey: 'unit_id', as: 'unit' });

module.exports = {
  sequelize,
  User,
  Unit,
  Tagihan,
};
