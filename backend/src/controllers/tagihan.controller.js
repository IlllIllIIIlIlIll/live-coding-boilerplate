/**
 * TODO: implementasikan CRUD Tagihan (table `invoices`) sesuai SPEC.md bagian 6.
 * Ingat aturan akses: admin lihat semua tagihan, pemilik hanya lihat tagihan
 * dari unit miliknya sendiri.
 */

// GET /api/tagihan
async function getAll(req, res, next) {
  res.status(501).json({ message: 'getAll tagihan belum diimplementasikan' });
}

// GET /api/tagihan/:id
async function getById(req, res, next) {
  res.status(501).json({ message: 'getById tagihan belum diimplementasikan' });
}

// POST /api/tagihan (admin only)
async function create(req, res, next) {
  res.status(501).json({ message: 'create tagihan belum diimplementasikan' });
}

// PUT /api/tagihan/:id (admin only)
async function update(req, res, next) {
  res.status(501).json({ message: 'update tagihan belum diimplementasikan' });
}

// DELETE /api/tagihan/:id (admin only)
async function remove(req, res, next) {
  res.status(501).json({ message: 'remove tagihan belum diimplementasikan' });
}

module.exports = { getAll, getById, create, update, remove };
