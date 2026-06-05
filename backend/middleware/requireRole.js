module.exports = function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.adminUser) {
      return res.status(401).json({ error: 'Autenticação necessária.' });
    }
    if (!roles.includes(req.adminUser.role)) {
      return res.status(403).json({ error: 'Acesso não autorizado para este perfil.' });
    }
    next();
  };
};
