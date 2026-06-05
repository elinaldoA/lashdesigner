const router      = require('express').Router();
const db          = require('../db');
const { v4: uuid } = require('uuid');
const requireAuth  = require('../middleware/requireAuth');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM services ORDER BY created_at ASC');
    res.json(rows.map(mapService));
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erro interno do servidor.' }); }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, description, price, duration, category } = req.body;
    if (!name || !description || price == null || !duration || !category) {
      return res.status(400).json({ error: 'Campos obrigatórios: name, description, price, duration, category.' });
    }

    const { image, active = true, featured = false } = req.body;
    const id = uuid();
    await db.query(
      `INSERT INTO services (id, name, description, price, duration, category, image, active, featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, description, price, duration, category, image || null, active ? 1 : 0, featured ? 1 : 0]
    );
    const [rows] = await db.query('SELECT * FROM services WHERE id = ?', [id]);
    res.status(201).json(mapService(rows[0]));
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erro interno do servidor.' }); }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { name, description, price, duration, category } = req.body;
    if (!name || !description || price == null || !duration || !category) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
    }

    const { image, active, featured } = req.body;
    await db.query(
      `UPDATE services SET name=?, description=?, price=?, duration=?, category=?, image=?, active=?, featured=? WHERE id=?`,
      [name, description, price, duration, category, image || null, active ? 1 : 0, featured ? 1 : 0, req.params.id]
    );
    const [rows] = await db.query('SELECT * FROM services WHERE id = ?', [req.params.id]);
    res.json(mapService(rows[0]));
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erro interno do servidor.' }); }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await db.query('DELETE FROM services WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erro interno do servidor.' }); }
});

function mapService(r) {
  return {
    id: r.id, name: r.name, description: r.description,
    price: parseFloat(r.price), duration: r.duration,
    category: r.category, image: r.image,
    active: r.active === 1, featured: r.featured === 1,
  };
}

module.exports = router;
