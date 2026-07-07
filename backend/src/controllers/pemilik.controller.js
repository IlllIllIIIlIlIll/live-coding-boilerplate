const bcrypt = require('bcryptjs');
const { User } = require('../models');

/**
 * Pemilik = User dengan role 'pemilik'. Endpoint ini admin-only (lihat pemilik.routes.js).
 */

// GET /api/pemilik
async function getAll(req, res, next) {
  try {
    const pemilik = await User.findAll({
      where: { role: 'pemilik' },
      attributes: { exclude: ['password', 'push_subscription', 'fcm_token'] },
      order: [['id', 'ASC']],
    });
    res.json(pemilik);
  } catch (err) {
    next(err);
  }
}

// GET /api/pemilik/:id
async function getById(req, res, next) {
  try {
    const pemilik = await User.findOne({
      where: { id: req.params.id, role: 'pemilik' },
      attributes: { exclude: ['password', 'push_subscription', 'fcm_token'] },
    });

    if (!pemilik) {
      return res.status(404).json({ message: 'Pemilik tidak ditemukan' });
    }

    res.json(pemilik);
  } catch (err) {
    next(err);
  }
}

// POST /api/pemilik
async function create(req, res, next) {
  try {
    const { nama, email, no_hp, password } = req.body;

    if (!nama) {
      return res.status(400).json({ message: 'nama wajib diisi' });
    }

    if (!email && !no_hp) {
      return res.status(400).json({ message: 'Wajib mengisi salah satu dari email atau no_hp' });
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const pemilik = await User.create({
      nama,
      email: email || null,
      no_hp: no_hp || null,
      password: hashedPassword,
      role: 'pemilik',
    });

    const { password: _password, ...data } = pemilik.toJSON();
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

// PUT /api/pemilik/:id
async function update(req, res, next) {
  try {
    const pemilik = await User.findOne({ where: { id: req.params.id, role: 'pemilik' } });

    if (!pemilik) {
      return res.status(404).json({ message: 'Pemilik tidak ditemukan' });
    }

    const { nama, email, no_hp, password } = req.body;

    if (nama !== undefined) pemilik.nama = nama;
    if (email !== undefined) pemilik.email = email || null;
    if (no_hp !== undefined) pemilik.no_hp = no_hp || null;
    if (password) pemilik.password = await bcrypt.hash(password, 10);

    if (!pemilik.email && !pemilik.no_hp) {
      return res.status(400).json({ message: 'Wajib mengisi salah satu dari email atau no_hp' });
    }

    await pemilik.save();

    const { password: _password, ...data } = pemilik.toJSON();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/pemilik/:id
async function remove(req, res, next) {
  try {
    const pemilik = await User.findOne({ where: { id: req.params.id, role: 'pemilik' } });

    if (!pemilik) {
      return res.status(404).json({ message: 'Pemilik tidak ditemukan' });
    }

    await pemilik.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, update, remove };
