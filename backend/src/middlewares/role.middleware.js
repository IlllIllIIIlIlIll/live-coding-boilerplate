function roleMiddleware(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Belum terautentikasi' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Tidak memiliki akses' });
    }

    next();
  };
}

module.exports = roleMiddleware;
