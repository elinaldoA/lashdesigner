const router      = require('express').Router();
const db          = require('../db');
const { v4: uuid } = require('uuid');
const requireAuth  = require('../middleware/requireAuth');
const audit        = require('../utils/audit');

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM products ORDER BY name ASC');
    res.json(rows.map(mapProduct));
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erro interno do servidor.' }); }
});

router.post('/', async (req, res) => {
  try {
    const { name, category, price, costPrice, quantity, minStock, unit } = req.body;
    if (!name || !category || price == null || costPrice == null || quantity == null || minStock == null || !unit) {
      return res.status(400).json({ error: 'Campos obrigatórios: name, category, price, costPrice, quantity, minStock, unit.' });
    }

    const numPrice     = parseFloat(price);
    const numCostPrice = parseFloat(costPrice);
    const numQty       = parseInt(quantity, 10);
    const numMinStock  = parseInt(minStock, 10);
    if (isNaN(numPrice)     || numPrice < 0)     return res.status(400).json({ error: 'Preço inválido.' });
    if (isNaN(numCostPrice) || numCostPrice < 0) return res.status(400).json({ error: 'Preço de custo inválido.' });
    if (isNaN(numQty)       || numQty < 0)       return res.status(400).json({ error: 'Quantidade inválida.' });
    if (isNaN(numMinStock)  || numMinStock < 0)  return res.status(400).json({ error: 'Estoque mínimo inválido.' });
    if (String(name).length > 150) return res.status(400).json({ error: 'Nome muito longo.' });

    const { description, supplier, image, storeVisible, storeFeatured } = req.body;
    const id = uuid();
    await db.query(
      `INSERT INTO products (id, name, description, category, price, cost_price, quantity, min_stock, unit, supplier, image, store_visible, store_featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, description || null, category, price, costPrice, quantity, minStock, unit, supplier || null, image || null, storeVisible ? 1 : 0, storeFeatured ? 1 : 0]
    );
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    await audit(req.adminUser, 'CREATE', 'products', id);
    res.status(201).json(mapProduct(rows[0]));
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erro interno do servidor.' }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, category, price, costPrice, quantity, minStock, unit } = req.body;
    if (!name || !category || price == null || costPrice == null || quantity == null || minStock == null || !unit) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
    }

    const numPrice     = parseFloat(price);
    const numCostPrice = parseFloat(costPrice);
    const numQty       = parseInt(quantity, 10);
    const numMinStock  = parseInt(minStock, 10);
    if (isNaN(numPrice)     || numPrice < 0)     return res.status(400).json({ error: 'Preço inválido.' });
    if (isNaN(numCostPrice) || numCostPrice < 0) return res.status(400).json({ error: 'Preço de custo inválido.' });
    if (isNaN(numQty)       || numQty < 0)       return res.status(400).json({ error: 'Quantidade inválida.' });
    if (isNaN(numMinStock)  || numMinStock < 0)  return res.status(400).json({ error: 'Estoque mínimo inválido.' });
    if (String(name).length > 150) return res.status(400).json({ error: 'Nome muito longo.' });

    const { description, supplier, image, storeVisible, storeFeatured } = req.body;
    await db.query(
      `UPDATE products SET name=?, description=?, category=?, price=?, cost_price=?, quantity=?, min_stock=?, unit=?, supplier=?, image=?, store_visible=?, store_featured=? WHERE id=?`,
      [name, description || null, category, price, costPrice, quantity, minStock, unit, supplier || null, image || null, storeVisible ? 1 : 0, storeFeatured ? 1 : 0, req.params.id]
    );
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    await audit(req.adminUser, 'UPDATE', 'products', req.params.id);
    res.json(mapProduct(rows[0]));
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erro interno do servidor.' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await audit(req.adminUser, 'DELETE', 'products', req.params.id);
    await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erro interno do servidor.' }); }
});

function mapProduct(r) {
  return {
    id: r.id, name: r.name, description: r.description, category: r.category,
    price: parseFloat(r.price), costPrice: parseFloat(r.cost_price),
    quantity: r.quantity, minStock: r.min_stock, unit: r.unit,
    supplier: r.supplier, image: r.image,
    storeVisible: !!r.store_visible, storeFeatured: !!r.store_featured,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

module.exports = router;
