const router        = require('express').Router();
const db            = require('../db');
const { v4: uuid }  = require('uuid');
const requireAuth   = require('../middleware/requireAuth');
const rateLimit     = require('../middleware/rateLimit');
const sanitizeHtml  = require('sanitize-html');

const sanitizeText = (str) => sanitizeHtml(str, { allowedTags: [], allowedAttributes: {} });

const contactLimit = rateLimit({ windowMs: 60_000, max: 5, message: 'Muitas mensagens enviadas. Aguarde 1 minuto.' });

function mapMsg(r) {
  return { id: r.id, name: r.name, email: r.email, phone: r.phone, message: r.message, read: r.is_read === 1, createdAt: r.created_at };
}

router.get('/', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
    res.json(rows.map(mapMsg));
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erro interno do servidor.' }); }
});

router.post('/', contactLimit, async (req, res) => {
  try {
    const { name, message } = req.body;
    if (!name?.trim() || !message?.trim()) {
      return res.status(400).json({ error: 'Nome e mensagem são obrigatórios.' });
    }
    if (name.length > 100) return res.status(400).json({ error: 'Nome muito longo.' });
    if (message.length > 2000) return res.status(400).json({ error: 'Mensagem muito longa.' });

    const { email, phone } = req.body;
    if (email && !/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(email.trim())) {
      return res.status(400).json({ error: 'Email inválido.' });
    }
    const cleanName    = sanitizeText(name.trim());
    const cleanMessage = sanitizeText(message.trim());
    const cleanPhone   = phone?.trim() || null;
    const id = uuid();
    await db.query('INSERT INTO contact_messages (id, name, email, phone, message) VALUES (?, ?, ?, ?, ?)',
      [id, cleanName, email?.trim() || null, cleanPhone, cleanMessage]);
    res.status(201).json({ id, name: cleanName, email, phone: cleanPhone, message: cleanMessage, read: false, createdAt: new Date() });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erro interno do servidor.' }); }
});

router.patch('/:id/read', requireAuth, async (req, res) => {
  try {
    await db.query('UPDATE contact_messages SET is_read = 1 WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erro interno do servidor.' }); }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await db.query('DELETE FROM contact_messages WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erro interno do servidor.' }); }
});

module.exports = router;
