const router      = require('express').Router();
const db          = require('../db');
const { v4: uuid } = require('uuid');
const requireAuth  = require('../middleware/requireAuth');
const audit        = require('../utils/audit');

const VALID_PAYMENT  = new Set(['cash', 'credit', 'debit', 'pix', 'transfer']);
const VALID_SALE_STATUS = new Set(['completed', 'pending', 'cancelled']);

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const [sales] = await db.query('SELECT * FROM sales ORDER BY created_at DESC');
    const [items] = await db.query('SELECT * FROM sale_items');
    const result = sales.map(s => ({
      id: s.id, clientId: s.client_id, clientName: s.client_name,
      appointmentId: s.appointment_id,
      subtotal: parseFloat(s.subtotal), discount: parseFloat(s.discount), total: parseFloat(s.total),
      paymentMethod: s.payment_method, installments: s.installments,
      status: s.status, notes: s.notes, createdAt: s.created_at,
      items: items.filter(i => i.sale_id === s.id).map(i => ({
        id: i.id, type: i.type, itemId: i.item_id, name: i.name,
        quantity: i.quantity, price: parseFloat(i.price), discount: parseFloat(i.discount || 0),
      })),
    }));
    res.json(result);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erro interno do servidor.' }); }
});

router.post('/', async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { items, subtotal, total, paymentMethod } = req.body;
    if (!items?.length || subtotal == null || total == null || !paymentMethod) {
      return res.status(400).json({ error: 'Campos obrigatórios: items, subtotal, total, paymentMethod.' });
    }

    if (!VALID_PAYMENT.has(paymentMethod)) return res.status(400).json({ error: 'Forma de pagamento inválida.' });
    const numSubtotal = parseFloat(subtotal);
    const numTotal    = parseFloat(total);
    const numDiscount = parseFloat(req.body.discount ?? 0);
    if (isNaN(numSubtotal) || numSubtotal < 0) return res.status(400).json({ error: 'Subtotal inválido.' });
    if (isNaN(numTotal)    || numTotal < 0)    return res.status(400).json({ error: 'Total inválido.' });
    if (isNaN(numDiscount) || numDiscount < 0) return res.status(400).json({ error: 'Desconto inválido.' });

    await conn.beginTransaction();
    const { clientId, clientName, appointmentId, installments, notes } = req.body;
    const status = VALID_SALE_STATUS.has(req.body.status) ? req.body.status : 'completed';
    const discount = numDiscount;
    const saleId = uuid();

    await conn.query(
      `INSERT INTO sales (id, client_id, client_name, appointment_id, subtotal, discount, total, payment_method, installments, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [saleId, clientId || null, clientName || null, appointmentId || null, subtotal, discount, total, paymentMethod, installments || 1, status || 'completed', notes || null]
    );

    for (const item of items) {
      await conn.query(
        `INSERT INTO sale_items (id, sale_id, type, item_id, name, quantity, price, discount)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [uuid(), saleId, item.type, item.itemId, item.name, item.quantity, item.price, item.discount || 0]
      );
    }

    await conn.commit();
    await audit(req.adminUser, 'CREATE', 'sales', saleId);
    const [rows] = await conn.query('SELECT * FROM sales WHERE id = ?', [saleId]);
    const [saleItems] = await conn.query('SELECT * FROM sale_items WHERE sale_id = ?', [saleId]);
    res.status(201).json({ ...rows[0], items: saleItems });
  } catch (e) {
    await conn.rollback().catch(() => {});
    console.error(e);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  } finally {
    conn.release();
  }
});

module.exports = router;
