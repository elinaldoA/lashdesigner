const router    = require('express').Router();
const bcrypt    = require('bcryptjs');
const { v4: uuid } = require('uuid');
const db        = require('../db');
const rateLimit = require('../middleware/rateLimit');
const audit     = require('../utils/audit');

const isProd = process.env.NODE_ENV === 'production';

const COOKIE_OPTS = {
  httpOnly: true,
  secure:   isProd,
  sameSite: 'strict',
  maxAge:   8 * 60 * 60 * 1000, // 8 horas
};

const SESSION_HOURS = 8;

// Dummy hash usado para comparação quando e-mail não existe (previne timing attack)
const DUMMY_HASH = '$2b$12$invalidhashthatisonlyusedfortimingnormalization000000000';

// Rate limit por IP (camada 1)
const loginLimitByIp = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      20,
  message:  'Muitas tentativas de login. Aguarde 15 minutos.',
});

// Rate limit por e-mail (camada 2) — persiste entre IPs diferentes
const emailAttempts = new Map();
const EMAIL_WINDOW_MS = 15 * 60 * 1000;
const EMAIL_MAX = 5;

function checkEmailLimit(email) {
  const now = Date.now();
  const key = email.toLowerCase().trim();
  const rec = emailAttempts.get(key) || { count: 0, resetAt: now + EMAIL_WINDOW_MS };
  if (now > rec.resetAt) { rec.count = 0; rec.resetAt = now + EMAIL_WINDOW_MS; }
  rec.count++;
  emailAttempts.set(key, rec);
  return rec.count > EMAIL_MAX;
}

// Limpa entradas antigas a cada 15 min
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of emailAttempts) { if (now > v.resetAt) emailAttempts.delete(k); }
}, EMAIL_WINDOW_MS).unref();

// POST /api/auth/login
router.post('/login', loginLimitByIp, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    if (checkEmailLimit(email)) {
      return res.status(429).json({ error: 'Muitas tentativas para este e-mail. Aguarde 15 minutos.' });
    }

    const [rows] = await db.query(
      'SELECT * FROM admin_users WHERE email = ? AND active = 1 LIMIT 1',
      [email.toLowerCase().trim()]
    );

    // Sempre executa bcrypt.compare para evitar timing attack por enumeração de e-mail
    const hashToCompare = rows.length ? rows[0].password_hash : DUMMY_HASH;
    const match = await bcrypt.compare(password, hashToCompare);

    if (!rows.length || !match) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
    }

    const adminUser = rows[0];

    const token = uuid();
    const expiresAt = new Date(Date.now() + SESSION_HOURS * 3600 * 1000);

    await db.query(
      'UPDATE admin_users SET session_token = ?, session_expires_at = ?, last_login = NOW() WHERE id = ?',
      [token, expiresAt, adminUser.id]
    );

    res.cookie('auth_token', token, COOKIE_OPTS);

    const user = { id: adminUser.id, name: adminUser.name, email: adminUser.email, role: adminUser.role };
    await audit(user, 'LOGIN', 'admin_users', adminUser.id);

    res.json({ user });
  } catch {
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// GET /api/auth/me  — valida o token e retorna o usuário
router.get('/me', async (req, res) => {
  try {
    const token = req.cookies?.auth_token || req.headers['x-auth-token'];
    if (!token) return res.status(401).json({ error: 'Token não fornecido.' });

    const [rows] = await db.query(
      'SELECT id, name, email, role FROM admin_users WHERE session_token = ? AND active = 1 AND session_expires_at > NOW() LIMIT 1',
      [token]
    );

    if (!rows.length) {
      return res.status(401).json({ error: 'Sessão inválida ou expirada.' });
    }

    res.json({ user: rows[0] });
  } catch {
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
  try {
    const token = req.cookies?.auth_token || req.headers['x-auth-token'];
    if (token) {
      const [rows] = await db.query(
        'SELECT id, email FROM admin_users WHERE session_token = ? LIMIT 1',
        [token]
      );
      await db.query(
        'UPDATE admin_users SET session_token = NULL, session_expires_at = NULL WHERE session_token = ?',
        [token]
      );
      if (rows.length) {
        await audit({ id: rows[0].id, email: rows[0].email }, 'LOGOUT', 'admin_users', rows[0].id);
      }
    }
    res.clearCookie('auth_token', COOKIE_OPTS);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

module.exports = router;
