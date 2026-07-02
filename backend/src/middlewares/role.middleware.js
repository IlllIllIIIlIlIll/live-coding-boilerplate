/**
 * TODO: implementasikan pembatasan akses berdasarkan role.
 * Contoh pemakaian: roleMiddleware(['admin'])
 * - Jika req.user belum ada -> 401
 * - Jika req.user.role tidak termasuk allowedRoles -> 403
 * - Jika lolos -> next()
 */
function roleMiddleware(allowedRoles = []) {
  return (req, res, next) => {
    res.status(501).json({ message: 'roleMiddleware belum diimplementasikan' });
  };
}

module.exports = roleMiddleware;
