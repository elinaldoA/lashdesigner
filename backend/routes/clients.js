const router      = require('express').Router();
const db          = require('../db');
const { v4: uuid } = require('uuid');
const requireAuth  = require('../middleware/requireAuth');
const requireRole  = require('../middleware/requireRole');
const audit        = require('../utils/audit');

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM clients ORDER BY registered_at DESC');
    res.json(rows.map(mapClient));
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erro interno do servidor.' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM clients WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Não encontrado' });
    await audit(req.adminUser, 'READ', 'clients', req.params.id);
    res.json(mapClient(rows[0]));
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erro interno do servidor.' }); }
});

router.post('/', async (req, res) => {
  try {
    const { name, phone } = req.body;
    if (!name || !phone) return res.status(400).json({ error: 'Nome e telefone são obrigatórios.' });

    const { email, whatsapp, birthdate, notes, source = 'manual', photo } = req.body;
    const id = uuid();
    await db.query(
      `INSERT INTO clients (id, name, email, phone, whatsapp, birthdate, notes, source, photo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, email || null, phone, whatsapp || null, birthdate || null, notes || null, source, photo || null]
    );
    const [rows] = await db.query('SELECT * FROM clients WHERE id = ?', [id]);
    await audit(req.adminUser, 'CREATE', 'clients', id);
    res.status(201).json(mapClient(rows[0]));
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erro interno do servidor.' }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, email, phone, whatsapp, birthdate, notes, photo,
            total_appointments, last_service, next_maintenance } = req.body;
    if (!name || !phone) return res.status(400).json({ error: 'Nome e telefone são obrigatórios.' });

    await db.query(
      `UPDATE clients SET name=?, email=?, phone=?, whatsapp=?, birthdate=?, notes=?, photo=?,
       total_appointments=COALESCE(?,total_appointments),
       last_service=COALESCE(?,last_service),
       next_maintenance=COALESCE(?,next_maintenance)
       WHERE id=?`,
      [name, email || null, phone, whatsapp || null, birthdate || null, notes || null, photo || null,
       total_appointments, last_service, next_maintenance, req.params.id]
    );
    const [rows] = await db.query('SELECT * FROM clients WHERE id = ?', [req.params.id]);
    await audit(req.adminUser, 'UPDATE', 'clients', req.params.id);
    res.json(mapClient(rows[0]));
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erro interno do servidor.' }); }
});

router.delete('/:id', requireRole('admin'), async (req, res) => {
  try {
    await audit(req.adminUser, 'DELETE', 'clients', req.params.id);
    await db.query('DELETE FROM clients WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erro interno do servidor.' }); }
});

function mapClient(r) {
  return {
    id: r.id, name: r.name, email: r.email, phone: r.phone,
    whatsapp: r.whatsapp, birthdate: r.birthdate, notes: r.notes,
    source: r.source, photo: r.photo,
    totalAppointments: r.total_appointments,
    lastService: r.last_service, nextMaintenanceSuggested: r.next_maintenance,
    registeredAt: r.registered_at,
  };
}

module.exports = router;
