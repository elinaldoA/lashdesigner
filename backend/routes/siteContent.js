const router       = require('express').Router();
const db           = require('../db');
const requireAuth  = require('../middleware/requireAuth');
const sanitizeHtml = require('sanitize-html');

const VALID_SECTIONS    = new Set(['hero', 'about', 'contact', 'settings']);
const MAP_ALLOWED_HOSTS = new Set(['maps.google.com', 'www.google.com', 'maps.googleapis.com']);

function sanitizeString(str) {
  return sanitizeHtml(str, { allowedTags: [], allowedAttributes: {} });
}

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT section, content FROM site_content');
    const result = {};
    rows.forEach(r => {
      result[r.section] = typeof r.content === 'string' ? JSON.parse(r.content) : r.content;
    });
    res.json(result);
  } catch { res.status(500).json({ error: 'Erro interno do servidor.' }); }
});

router.get('/:section', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT content FROM site_content WHERE section = ?', [req.params.section]);
    if (!rows.length) return res.status(404).json({ error: 'Seção não encontrada' });
    const content = typeof rows[0].content === 'string' ? JSON.parse(rows[0].content) : rows[0].content;
    res.json(content);
  } catch { res.status(500).json({ error: 'Erro interno do servidor.' }); }
});

router.put('/:section', requireAuth, async (req, res) => {
  try {
    const section = req.params.section;
    if (!VALID_SECTIONS.has(section)) {
      return res.status(400).json({ error: 'Seção inválida.' });
    }

    if (typeof req.body !== 'object' || Array.isArray(req.body) || req.body === null) {
      return res.status(400).json({ error: 'Conteúdo inválido.' });
    }
    const sanitized = {};
    for (const [key, val] of Object.entries(req.body)) {
      if (typeof key !== 'string' || key.length > 100) {
        return res.status(400).json({ error: 'Nome de campo inválido.' });
      }
      if (val !== null && val !== undefined && typeof val !== 'string' && typeof val !== 'number' && typeof val !== 'boolean' && !Array.isArray(val) && typeof val !== 'object') {
        return res.status(400).json({ error: `Tipo de valor inválido para campo: ${key}` });
      }
      if (key === 'mapEmbed' && val) {
        if (typeof val !== 'string') return res.status(400).json({ error: 'O campo mapEmbed deve ser uma string.' });
        try {
          const url = new URL(val);
          if (url.protocol !== 'https:') return res.status(400).json({ error: 'O campo mapEmbed deve usar HTTPS.' });
          if (!MAP_ALLOWED_HOSTS.has(url.hostname)) return res.status(400).json({ error: 'O campo mapEmbed deve ser uma URL do Google Maps.' });
          sanitized[key] = val;
        } catch {
          return res.status(400).json({ error: 'O campo mapEmbed contém uma URL inválida.' });
        }
        continue;
      }
      if (typeof val === 'string') {
        if (val.length > 5000) return res.status(400).json({ error: `Conteúdo muito longo para campo: ${key}` });
        sanitized[key] = sanitizeString(val);
      } else {
        sanitized[key] = val;
      }
    }

    const content = JSON.stringify(sanitized);
    if (content.length > 50_000) {
      return res.status(400).json({ error: 'Conteúdo total muito grande.' });
    }

    await db.query(
      `INSERT INTO site_content (section, content) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE content = VALUES(content)`,
      [section, content]
    );
    res.json({ success: true, section, content: sanitized });
  } catch { res.status(500).json({ error: 'Erro interno do servidor.' }); }
});

module.exports = router;
