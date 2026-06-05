const router      = require('express').Router();
const db          = require('../db');
const { v4: uuid } = require('uuid');
const requireAuth  = require('../middleware/requireAuth');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM blocked_slots ORDER BY date, start_time');
    res.json(rows.map(r => ({
      id: r.id,
      date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : r.date,
      startTime: r.start_time, endTime: r.end_time, reason: r.reason,
    })));
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erro interno do servidor.' }); }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { date, startTime, endTime } = req.body;
    if (!date || !startTime || !endTime) {
      return res.status(400).json({ error: 'Campos obrigatórios: date, startTime, endTime.' });
    }

    const { reason } = req.body;
    const id = uuid();
    await db.query('INSERT INTO blocked_slots (id, date, start_time, end_time, reason) VALUES (?, ?, ?, ?, ?)',
      [id, date, startTime, endTime, reason || null]);
    res.status(201).json({ id, date, startTime, endTime, reason: reason || null });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erro interno do servidor.' }); }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await db.query('DELETE FROM blocked_slots WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erro interno do servidor.' }); }
});

module.exports = router;
