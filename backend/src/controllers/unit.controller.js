/**
 * TODO: implementasikan CRUD Unit sesuai SPEC.md bagian 6.
 * Ingat aturan akses: admin lihat semua unit, pemilik hanya lihat unit miliknya
 * (filter berdasarkan req.user.id / req.user.role di level query, bukan cuma di UI).
 */

// GET /api/units
async function getAll(req, res, next) {
  res.status(501).json({ message: 'getAll unit belum diimplementasikan' });
}

// GET /api/units/:id
async function getById(req, res, next) {
  res.status(501).json({ message: 'getById unit belum diimplementasikan' });
}

// POST /api/units (admin only)
async function create(req, res, next) {
  res.status(501).json({ message: 'create unit belum diimplementasikan' });
}

// PUT /api/units/:id (admin only)
async function update(req, res, next) {
  res.status(501).json({ message: 'update unit belum diimplementasikan' });
}

// DELETE /api/units/:id (admin only)
async function remove(req, res, next) {
  res.status(501).json({ message: 'remove unit belum diimplementasikan' });
}

module.exports = { getAll, getById, create, update, remove };
