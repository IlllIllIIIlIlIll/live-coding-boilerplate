const { Tagihan, Unit, User } = require('../models');
const { checkOverdueInvoices } = require('../services/pushPoller.service');

const PERIODE_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

// Cek & kirim push segera setelah tagihan dibuat/diubah, kalau state barunya
// sudah overdue+belum_bayar — supaya tidak perlu menunggu poller/klik tombol
// demo untuk kasus "baru saja diedit jadi overdue". Tidak pernah melempar error
// ke response CRUD kalau pengiriman push gagal.
async function triggerPushCheckSilently() {
  try {
    await checkOverdueInvoices();
  } catch (err) {
    console.error('Push check setelah CRUD tagihan gagal:', err.message);
  }
}

const unitInclude = {
  model: Unit,
  as: 'unit',
  attributes: ['id', 'nama_unit', 'pemilik_id'],
  include: [{ model: User, as: 'pemilik', attributes: ['id', 'nama'] }],
};

function unitScopeForUser(user) {
  return user.role === 'admin' ? {} : { pemilik_id: user.id };
}

// GET /api/tagihan
async function getAll(req, res, next) {
  try {
    const tagihan = await Tagihan.findAll({
      include: [{ ...unitInclude, where: unitScopeForUser(req.user) }],
      order: [['id', 'ASC']],
    });
    res.json(tagihan);
  } catch (err) {
    next(err);
  }
}

// GET /api/tagihan/:id
async function getById(req, res, next) {
  try {
    const tagihan = await Tagihan.findOne({
      where: { id: req.params.id },
      include: [{ ...unitInclude, where: unitScopeForUser(req.user) }],
    });

    if (!tagihan) {
      return res.status(404).json({ message: 'Tagihan tidak ditemukan' });
    }

    res.json(tagihan);
  } catch (err) {
    next(err);
  }
}

// POST /api/tagihan (admin only)
async function create(req, res, next) {
  try {
    const { unit_id, periode, jumlah, status, jatuh_tempo, tanggal_bayar } = req.body;

    if (!unit_id || !periode || !jumlah || !jatuh_tempo) {
      return res.status(400).json({ message: 'unit_id, periode, jumlah, dan jatuh_tempo wajib diisi' });
    }

    if (!PERIODE_REGEX.test(periode)) {
      return res.status(400).json({ message: 'periode harus berformat YYYY-MM' });
    }

    const unit = await Unit.findByPk(unit_id);
    if (!unit) {
      return res.status(400).json({ message: 'unit_id tidak ditemukan' });
    }

    const tagihan = await Tagihan.create({
      unit_id,
      periode,
      jumlah,
      status: status || 'belum_bayar',
      jatuh_tempo,
      tanggal_bayar: tanggal_bayar || null,
    });

    await triggerPushCheckSilently();

    res.status(201).json(tagihan);
  } catch (err) {
    next(err);
  }
}

// PUT /api/tagihan/:id (admin only)
async function update(req, res, next) {
  try {
    const tagihan = await Tagihan.findByPk(req.params.id);
    if (!tagihan) {
      return res.status(404).json({ message: 'Tagihan tidak ditemukan' });
    }

    const { unit_id, periode, jumlah, status, jatuh_tempo, tanggal_bayar } = req.body;

    if (periode !== undefined) {
      if (!PERIODE_REGEX.test(periode)) {
        return res.status(400).json({ message: 'periode harus berformat YYYY-MM' });
      }
      tagihan.periode = periode;
    }

    if (unit_id !== undefined) {
      const unit = await Unit.findByPk(unit_id);
      if (!unit) {
        return res.status(400).json({ message: 'unit_id tidak ditemukan' });
      }
      tagihan.unit_id = unit_id;
    }

    if (jumlah !== undefined) tagihan.jumlah = jumlah;
    if (status !== undefined) tagihan.status = status;
    if (jatuh_tempo !== undefined) tagihan.jatuh_tempo = jatuh_tempo;
    if (tanggal_bayar !== undefined) tagihan.tanggal_bayar = tanggal_bayar;

    // Reset guard notifikasi di setiap edit — supaya tiap kali tagihan disimpan
    // dan overdue+belum_bayar, notifikasi selalu terkirim ulang (bukan cuma
    // sekali saat transisi pertama ke status overdue).
    tagihan.notified_at = null;

    await tagihan.save();
    await triggerPushCheckSilently();
    res.json(tagihan);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/tagihan/:id (admin only)
async function remove(req, res, next) {
  try {
    const tagihan = await Tagihan.findByPk(req.params.id);
    if (!tagihan) {
      return res.status(404).json({ message: 'Tagihan tidak ditemukan' });
    }

    await tagihan.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, update, remove };
