const db = require('../db');

module.exports = async function requireAuth(req, res, next) {
  const token = req.cookies?.auth_token || req.headers['x-auth-token'];
  if (!token) return res.status(401).json({ error: 'Autenticação necessária.' });

  try {
    const [rows] = await db.query(
      'SELECT id, name, email, role FROM admin_users WHERE session_token = ? AND active = 1 AND session_expires_at > NOW() LIMIT 1',
      [token]
    );
    if (!rows.length) return res.status(401).json({ error: 'Sessão inválida ou expirada.' });
    req.adminUser = rows[0];
    next();
  } catch {
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};
