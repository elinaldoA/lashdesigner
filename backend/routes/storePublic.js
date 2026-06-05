const router       = require('express').Router();
const db           = require('../db');
const { v4: uuid } = require('uuid');

// GET /api/store/products — produtos visíveis na loja (sem autenticação)
router.get('/products', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM products WHERE store_visible = 1 ORDER BY store_featured DESC, name ASC'
    );
    res.json(rows.map(mapProduct));
  } catch { res.status(500).json({ error: 'Erro interno do servidor.' }); }
});

// POST /api/store/orders — criar pedido (sem autenticação)
router.post('/orders', async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { customerName, customerEmail, customerPhone, customerAddress, items, paymentMethod, notes } = req.body;

    if (!customerName || !customerPhone || !items || !items.length || !paymentMethod) {
      return res.status(400).json({ error: 'Campos obrigatórios: customerName, customerPhone, items, paymentMethod.' });
    }

    const VALID_PAYMENT = new Set(['cash', 'credit', 'debit', 'pix', 'transfer']);
    if (!VALID_PAYMENT.has(paymentMethod)) {
      return res.status(400).json({ error: 'Forma de pagamento inválida.' });
    }
    if (String(customerName).length > 150) return res.status(400).json({ error: 'Nome muito longo.' });
    if (String(customerPhone).length > 30)  return res.status(400).json({ error: 'Telefone muito longo.' });
    if (customerEmail   && String(customerEmail).length   > 150) return res.status(400).json({ error: 'Email muito longo.' });
    if (customerAddress && String(customerAddress).length > 500) return res.status(400).json({ error: 'Endereço muito longo.' });

    if (!Array.isArray(items) || items.length > 50) {
      return res.status(400).json({ error: 'Lista de itens inválida.' });
    }

    // Valida estrutura dos itens antes de adquirir locks
    for (const item of items) {
      if (!item.productId) return res.status(400).json({ error: 'Cada item deve ter productId.' });
      const qty = parseInt(item.quantity, 10);
      if (!qty || qty < 1 || qty > 999) return res.status(400).json({ error: 'Quantidade inválida em um ou mais itens.' });
    }

    // Inicia transação ANTES de verificar estoque para evitar race condition
    await conn.beginTransaction();

    // Busca preços do banco e bloqueia linhas com FOR UPDATE (nunca confiar no preço do cliente)
    const resolvedItems = [];
    for (const item of items) {
      const qty = parseInt(item.quantity, 10);
      const [prows] = await conn.query(
        'SELECT id, name, price, quantity FROM products WHERE id = ? AND store_visible = 1 LIMIT 1 FOR UPDATE',
        [item.productId]
      );
      if (!prows.length) {
        const err = new Error('Um ou mais produtos não estão disponíveis.');
        err.clientError = 400;
        throw err;
      }
      if (prows[0].quantity < qty) {
        const err = new Error(`Estoque insuficiente para: ${prows[0].name}`);
        err.clientError = 400;
        throw err;
      }
      resolvedItems.push({ ...prows[0], quantity: qty });
    }

    const subtotal = resolvedItems.reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0);
    const shipping = 0;
    const discount = 0;
    const total = subtotal + shipping - discount;

    const orderId = uuid();
    await conn.query(
      `INSERT INTO store_orders (id, customer_name, customer_email, customer_phone, customer_address, subtotal, shipping, discount, total, payment_method, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [orderId, customerName, customerEmail || null, customerPhone, customerAddress || null, subtotal, shipping, discount, total, paymentMethod, notes || null]
    );

    for (const item of resolvedItems) {
      await conn.query(
        `INSERT INTO store_order_items (id, order_id, product_id, name, quantity, price) VALUES (?, ?, ?, ?, ?, ?)`,
        [uuid(), orderId, item.id, item.name, item.quantity, item.price]
      );
      await conn.query(
        'UPDATE products SET quantity = GREATEST(0, quantity - ?) WHERE id = ?',
        [item.quantity, item.id]
      );
    }

    await conn.commit();

    const [orderRows] = await conn.query('SELECT * FROM store_orders WHERE id = ?', [orderId]);
    const [itemRows]  = await conn.query('SELECT * FROM store_order_items WHERE order_id = ?', [orderId]);

    res.status(201).json({ ...mapOrder(orderRows[0]), items: itemRows.map(mapOrderItem) });
  } catch (e) {
    await conn.rollback().catch(() => {});
    if (e.clientError) return res.status(e.clientError).json({ error: e.message });
    console.error('store/orders error:', e);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  } finally {
    conn.release();
  }
});

function mapProduct(r) {
  return {
    id: r.id, name: r.name, description: r.description, category: r.category,
    price: parseFloat(r.price), quantity: r.quantity, unit: r.unit,
    image: r.image, storeFeatured: !!r.store_featured,
  };
}

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
