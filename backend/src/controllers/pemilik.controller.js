/**
 * TODO: implementasikan CRUD Pemilik (admin only) sesuai SPEC.md bagian 6.
 * Pemilik = User dengan role 'pemilik'.
 */

// GET /api/pemilik
async function getAll(req, res, next) {
  res.status(501).json({ message: 'getAll pemilik belum diimplementasikan' });
}

// GET /api/pemilik/:id
async function getById(req, res, next) {
  res.status(501).json({ message: 'getById pemilik belum diimplementasikan' });
}

// POST /api/pemilik
async function create(req, res, next) {
  res.status(501).json({ message: 'create pemilik belum diimplementasikan' });
}

// PUT /api/pemilik/:id
async function update(req, res, next) {
  res.status(501).json({ message: 'update pemilik belum diimplementasikan' });
}

// DELETE /api/pemilik/:id
async function remove(req, res, next) {
  res.status(501).json({ message: 'remove pemilik belum diimplementasikan' });
}

module.exports = { getAll, getById, create, update, remove };
