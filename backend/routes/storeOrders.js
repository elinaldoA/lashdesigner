const router      = require('express').Router();
const db          = require('../db');
const requireAuth = require('../middleware/requireAuth');

router.use(requireAuth);

// GET /api/store-orders
router.get('/', async (req, res) => {
  try {
    const [orders] = await db.query('SELECT * FROM store_orders ORDER BY created_at DESC');
    const [items]  = await db.query('SELECT * FROM store_order_items ORDER BY order_id');

    const itemsByOrder = {};
    for (const item of items) {
      if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
      itemsByOrder[item.order_id].push(mapOrderItem(item));
    }

    res.json(orders.map(o => ({ ...mapOrder(o), items: itemsByOrder[o.id] || [] })));
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erro interno do servidor.' }); }
});

// PATCH /api/store-orders/:id/status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!valid.includes(status)) {
      return res.status(400).json({ error: 'Status inválido.' });
    }
    await db.query('UPDATE store_orders SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erro interno do servidor.' }); }
});

// DELETE /api/store-orders/:id
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM store_orders WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erro interno do servidor.' }); }
});

function mapOrder(r) {
  return {
    id: r.id,
    customerName: r.customer_name, customerEmail: r.customer_email,
    customerPhone: r.customer_phone, customerAddress: r.customer_address,
    subtotal: parseFloat(r.subtotal), shipping: parseFloat(r.shipping),
    discount: parseFloat(r.discount), total: parseFloat(r.total),
    paymentMethod: r.payment_method, status: r.status,
    notes: r.notes, createdAt: r.created_at,
  };
}

function mapOrderItem(r) {
  return {
    id: r.id, orderId: r.order_id, productId: r.product_id,
    name: r.name, quantity: r.quantity, price: parseFloat(r.price),
  };
}

module.exports = router;
