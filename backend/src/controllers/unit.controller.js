const { Unit, User } = require('../models');

const pemilikAttributes = ['id', 'nama', 'email', 'no_hp'];

function scopeForUser(user) {
  return user.role === 'admin' ? {} : { pemilik_id: user.id };
}

// GET /api/units
async function getAll(req, res, next) {
  try {
    const units = await Unit.findAll({
      where: scopeForUser(req.user),
      include: [{ model: User, as: 'pemilik', attributes: pemilikAttributes }],
      order: [['id', 'ASC']],
    });
    res.json(units);
  } catch (err) {
    next(err);
  }
}

// GET /api/units/:id
async function getById(req, res, next) {
  try {
    const unit = await Unit.findOne({
      where: { id: req.params.id, ...scopeForUser(req.user) },
      include: [{ model: User, as: 'pemilik', attributes: pemilikAttributes }],
    });

    if (!unit) {
      return res.status(404).json({ message: 'Unit tidak ditemukan' });
    }

    res.json(unit);
  } catch (err) {
    next(err);
  }
}

// POST /api/units (admin only)
async function create(req, res, next) {
  try {
    const { nama_unit, alamat, pemilik_id, status } = req.body;

    if (!nama_unit || !pemilik_id) {
      return res.status(400).json({ message: 'nama_unit dan pemilik_id wajib diisi' });
    }

    const pemilik = await User.findOne({ where: { id: pemilik_id, role: 'pemilik' } });
    if (!pemilik) {
      return res.status(400).json({ message: 'pemilik_id harus merujuk ke user dengan role pemilik' });
    }

    const unit = await Unit.create({
      nama_unit,
      alamat: alamat || null,
      pemilik_id,
      status: status || 'aktif',
    });

    res.status(201).json(unit);
  } catch (err) {
    next(err);
  }
}

// PUT /api/units/:id (admin only)
async function update(req, res, next) {
  try {
    const unit = await Unit.findByPk(req.params.id);
    if (!unit) {
      return res.status(404).json({ message: 'Unit tidak ditemukan' });
    }

    const { nama_unit, alamat, pemilik_id, status } = req.body;

    if (pemilik_id !== undefined) {
      const pemilik = await User.findOne({ where: { id: pemilik_id, role: 'pemilik' } });
      if (!pemilik) {
        return res.status(400).json({ message: 'pemilik_id harus merujuk ke user dengan role pemilik' });
      }
      unit.pemilik_id = pemilik_id;
    }

    if (nama_unit !== undefined) unit.nama_unit = nama_unit;
    if (alamat !== undefined) unit.alamat = alamat;
    if (status !== undefined) unit.status = status;

    await unit.save();
    res.json(unit);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/units/:id (admin only)
async function remove(req, res, next) {
  try {
    const unit = await Unit.findByPk(req.params.id);
    if (!unit) {
      return res.status(404).json({ message: 'Unit tidak ditemukan' });
    }

    await unit.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, update, remove };
