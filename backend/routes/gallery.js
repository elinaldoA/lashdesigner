const router      = require('express').Router();
const db          = require('../db');
const { v4: uuid } = require('uuid');
const requireAuth  = require('../middleware/requireAuth');

function mapG(r) {
  return {
    id: r.id, url: r.url, title: r.title, category: r.category,
    order: r.sort_order, uploadedAt: r.uploaded_at,
  };
}

const ALLOWED_CATEGORIES = new Set(['general', 'work', 'before-after', 'event']);

function isValidImageUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function validateGalleryInput(req, res) {
  const { url, title, category } = req.body;
  if (!url) { res.status(400).json({ error: 'URL da imagem é obrigatória.' }); return false; }
  if (!isValidImageUrl(url)) { res.status(400).json({ error: 'URL inválida. Use apenas URLs http ou https.' }); return false; }
  if (url.length > 2000) { res.status(400).json({ error: 'URL muito longa.' }); return false; }
  if (title && String(title).length > 255) { res.status(400).json({ error: 'Título muito longo.' }); return false; }
  if (category && !ALLOWED_CATEGORIES.has(category)) {
    req.body.category = 'general';
  }
  return true;
}

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM gallery ORDER BY sort_order ASC, uploaded_at ASC');
    res.json(rows.map(mapG));
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erro interno do servidor.' }); }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    if (!validateGalleryInput(req, res)) return;
    const { url, title, category = 'general', order = 0 } = req.body;
    const id = uuid();
    await db.query('INSERT INTO gallery (id, url, title, category, sort_order) VALUES (?, ?, ?, ?, ?)',
      [id, url, title || null, category, order]);
    const [rows] = await db.query('SELECT * FROM gallery WHERE id = ?', [id]);
    res.status(201).json(mapG(rows[0]));
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erro interno do servidor.' }); }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    if (!validateGalleryInput(req, res)) return;
    const { url, title, category, order } = req.body;
    await db.query('UPDATE gallery SET url=?, title=?, category=?, sort_order=? WHERE id=?',
      [url, title || null, category, order, req.params.id]);
    const [rows] = await db.query('SELECT * FROM gallery WHERE id = ?', [req.params.id]);
    res.json(mapG(rows[0]));
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erro interno do servidor.' }); }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await db.query('DELETE FROM gallery WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erro interno do servidor.' }); }
});

module.exports = router;
