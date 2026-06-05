const router      = require('express').Router();
const db          = require('../db');
const requireAuth  = require('../middleware/requireAuth');
const rateLimit    = require('../middleware/rateLimit');

const viewLimit = rateLimit({ windowMs: 60_000, max: 30, message: 'Limite de rastreamento atingido.' });

router.get('/', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM site_stats WHERE id = 1 LIMIT 1');
    res.json({ pageViews: rows.length ? rows[0].page_views : 0 });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erro interno do servidor.' }); }
});

router.post('/view', viewLimit, async (req, res) => {
  try {
    await db.query(
      `INSERT INTO site_stats (id, page_views) VALUES (1, 1)
       ON DUPLICATE KEY UPDATE page_views = page_views + 1`
    );
    const [rows] = await db.query('SELECT page_views FROM site_stats WHERE id = 1');
    res.json({ pageViews: rows[0].page_views });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erro interno do servidor.' }); }
});

module.exports = router;
