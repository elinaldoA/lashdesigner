const router      = require('express').Router();
const db          = require('../db');
const { v4: uuid } = require('uuid');
const requireAuth  = require('../middleware/requireAuth');

function mapT(r) {
  return {
    id: r.id, clientName: r.client_name, photo: r.photo, text: r.text,
    rating: r.rating,
    date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : r.date,
    approved: r.approved === 1, source: r.source, createdAt: r.created_at,
  };
}

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM testimonials ORDER BY created_at DESC');
    res.json(rows.map(mapT));
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erro interno do servidor.' }); }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { clientName, text, rating } = req.body;
    if (!clientName || !text || rating == null) {
      return res.status(400).json({ error: 'Campos obrigatórios: clientName, text, rating.' });
    }

    const { photo, date, approved = false, source = 'manual' } = req.body;
    const id = uuid();
    await db.query(
      `INSERT INTO testimonials (id, client_name, photo, text, rating, date, approved, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, clientName, photo || null, text, rating, date || null, approved ? 1 : 0, source]
    );
    const [rows] = await db.query('SELECT * FROM testimonials WHERE id = ?', [id]);
    res.status(201).json(mapT(rows[0]));
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erro interno do servidor.' }); }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { clientName, text, rating } = req.body;
    if (!clientName || !text || rating == null) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
    }

    const { photo, date, approved } = req.body;
    await db.query(
      `UPDATE testimonials SET client_name=?, photo=?, text=?, rating=?, date=?, approved=? WHERE id=?`,
      [clientName, photo || null, text, rating, date || null, approved ? 1 : 0, req.params.id]
    );
    const [rows] = await db.query('SELECT * FROM testimonials WHERE id = ?', [req.params.id]);
    res.json(mapT(rows[0]));
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erro interno do servidor.' }); }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await db.query('DELETE FROM testimonials WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erro interno do servidor.' }); }
});

module.exports = router;
