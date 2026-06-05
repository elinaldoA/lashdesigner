const router      = require('express').Router();
const db          = require('../db');
const { v4: uuid } = require('uuid');
const requireAuth  = require('../middleware/requireAuth');
const requireRole  = require('../middleware/requireRole');
const audit        = require('../utils/audit');

const VALID_TYPES = new Set(['income', 'expense']);

router.use(requireAuth);

function mapTx(r) {
  return {
    id: r.id, type: r.type, category: r.category, description: r.description,
    amount: parseFloat(r.amount), paymentMethod: r.payment_method,
    date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : r.date,
    saleId: r.sale_id, notes: r.notes, createdAt: r.created_at,
  };
}

router.get('/', async (req, res) => {
  try {
    const { month } = req.query;
    let q = 'SELECT * FROM transactions WHERE 1=1';
    const p = [];
    if (month) { q += ' AND DATE_FORMAT(date, "%Y-%m") = ?'; p.push(month); }
    q += ' ORDER BY date DESC, created_at DESC';
    const [rows] = await db.query(q, p);
    res.json(rows.map(mapTx));
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erro interno do servidor.' }); }
});

router.post('/', async (req, res) => {
  try {
    const { type, category, description, amount, date } = req.body;
    if (!type || !category || !description || amount == null || !date) {
      return res.status(400).json({ error: 'Campos obrigatórios: type, category, description, amount, date.' });
    }

    if (!VALID_TYPES.has(type)) return res.status(400).json({ error: 'Tipo inválido. Use income ou expense.' });
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return res.status(400).json({ error: 'Valor deve ser positivo.' });
    if (String(description).length > 255) return res.status(400).json({ error: 'Descrição muito longa.' });
    if (String(category).length > 100) return res.status(400).json({ error: 'Categoria muito longa.' });

    const { paymentMethod, saleId, notes } = req.body;
    const id = uuid();
    await db.query(
      `INSERT INTO transactions (id, type, category, description, amount, payment_method, date, sale_id, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, type, category, description, amount, paymentMethod || null, date, saleId || null, notes || null]
    );
    const [rows] = await db.query('SELECT * FROM transactions WHERE id = ?', [id]);
    await audit(req.adminUser, 'CREATE', 'transactions', id);
    res.status(201).json(mapTx(rows[0]));
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erro interno do servidor.' }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { type, category, description, amount, date } = req.body;
    if (!type || !category || !description || amount == null || !date) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
    }

    if (!VALID_TYPES.has(type)) return res.status(400).json({ error: 'Tipo inválido. Use income ou expense.' });
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return res.status(400).json({ error: 'Valor deve ser positivo.' });
    if (String(description).length > 255) return res.status(400).json({ error: 'Descrição muito longa.' });
    if (String(category).length > 100) return res.status(400).json({ error: 'Categoria muito longa.' });

    const { paymentMethod, notes } = req.body;
    await db.query(
      `UPDATE transactions SET type=?, category=?, description=?, amount=?, payment_method=?, date=?, notes=? WHERE id=?`,
      [type, category, description, amount, paymentMethod || null, date, notes || null, req.params.id]
    );
    const [rows] = await db.query('SELECT * FROM transactions WHERE id = ?', [req.params.id]);
    await audit(req.adminUser, 'UPDATE', 'transactions', req.params.id);
    res.json(mapTx(rows[0]));
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erro interno do servidor.' }); }
});

router.delete('/:id', requireRole('admin'), async (req, res) => {
  try {
    await audit(req.adminUser, 'DELETE', 'transactions', req.params.id);
    await db.query('DELETE FROM transactions WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erro interno do servidor.' }); }
});

module.exports = router;
