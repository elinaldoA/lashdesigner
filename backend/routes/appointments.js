const router      = require('express').Router();
const db          = require('../db');
const { v4: uuid } = require('uuid');
const requireAuth  = require('../middleware/requireAuth');
const audit        = require('../utils/audit');

const VALID_STATUS = new Set(['pending', 'confirmed', 'cancelled', 'completed', 'no-show']);

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const { date, status } = req.query;
    let q = 'SELECT * FROM appointments WHERE 1=1';
    const p = [];
    if (date)   { q += ' AND date = ?';   p.push(date); }
    if (status) { q += ' AND status = ?'; p.push(status); }
    q += ' ORDER BY date DESC, time ASC';
    const [rows] = await db.query(q, p);
    res.json(rows.map(mapAppt));
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erro interno do servidor.' }); }
});

router.post('/', async (req, res) => {
  try {
    const { clientName, serviceName, date, time, duration, price } = req.body;
    if (!clientName || !serviceName || !date || !time || !duration || price == null) {
      return res.status(400).json({ error: 'Campos obrigatórios: clientName, serviceName, date, time, duration, price.' });
    }

    const { clientId, serviceId, status = 'pending', notes, source = 'manual' } = req.body;

    if (!VALID_STATUS.has(status)) return res.status(400).json({ error: 'Status inválido.' });
    const numPrice = parseFloat(price);
    const numDuration = parseInt(duration, 10);
    if (isNaN(numPrice) || numPrice < 0) return res.status(400).json({ error: 'Preço inválido.' });
    if (isNaN(numDuration) || numDuration <= 0) return res.status(400).json({ error: 'Duração inválida.' });
    if (String(clientName).length > 150) return res.status(400).json({ error: 'Nome do cliente muito longo.' });
    if (String(serviceName).length > 150) return res.status(400).json({ error: 'Nome do serviço muito longo.' });

    const id = uuid();
    await db.query(
      `INSERT INTO appointments (id, client_id, client_name, service_id, service_name, date, time, duration, status, price, notes, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, clientId || null, clientName, serviceId || null, serviceName, date, time, duration, status, price, notes || null, source]
    );
    const [rows] = await db.query('SELECT * FROM appointments WHERE id = ?', [id]);
    res.status(201).json(mapAppt(rows[0]));
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erro interno do servidor.' }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { clientName, serviceName, date, time, duration, status, price } = req.body;
    if (!clientName || !serviceName || !date || !time || !duration || !status || price == null) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
    }

    if (!VALID_STATUS.has(status)) return res.status(400).json({ error: 'Status inválido.' });
    const numPrice = parseFloat(price);
    const numDuration = parseInt(duration, 10);
    if (isNaN(numPrice) || numPrice < 0) return res.status(400).json({ error: 'Preço inválido.' });
    if (isNaN(numDuration) || numDuration <= 0) return res.status(400).json({ error: 'Duração inválida.' });
    if (String(clientName).length > 150) return res.status(400).json({ error: 'Nome do cliente muito longo.' });
    if (String(serviceName).length > 150) return res.status(400).json({ error: 'Nome do serviço muito longo.' });

    const { clientId, serviceId, notes } = req.body;
    await db.query(
      `UPDATE appointments SET client_id=?, client_name=?, service_id=?, service_name=?,
       date=?, time=?, duration=?, status=?, price=?, notes=? WHERE id=?`,
      [clientId || null, clientName, serviceId || null, serviceName,
       date, time, duration, status, price, notes || null, req.params.id]
    );
    const [rows] = await db.query('SELECT * FROM appointments WHERE id = ?', [req.params.id]);
    res.json(mapAppt(rows[0]));
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erro interno do servidor.' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await audit(req.adminUser, 'DELETE', 'appointments', req.params.id);
    await db.query('DELETE FROM appointments WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erro interno do servidor.' }); }
});

function mapAppt(r) {
  return {
    id: r.id, clientId: r.client_id, clientName: r.client_name,
    serviceId: r.service_id, serviceName: r.service_name,
    date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : r.date,
    time: r.time, duration: r.duration, status: r.status,
    price: parseFloat(r.price), notes: r.notes, source: r.source,
    createdAt: r.created_at,
  };
}

module.exports = router;
