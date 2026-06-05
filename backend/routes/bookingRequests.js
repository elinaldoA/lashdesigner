const router      = require('express').Router();
const db          = require('../db');
const { v4: uuid } = require('uuid');
const requireAuth  = require('../middleware/requireAuth');
const rateLimit    = require('../middleware/rateLimit');

const bookingLimit = rateLimit({ windowMs: 60_000, max: 5, message: 'Muitas solicitações. Aguarde 1 minuto.' });

const VALID_BOOKING_STATUS = new Set(['pending', 'confirmed', 'cancelled']);

function mapReq(r) {
  return {
    id: r.id, clientName: r.client_name, clientEmail: r.client_email,
    clientPhone: r.client_phone, clientWhatsapp: r.client_whatsapp,
    clientBirthdate: r.client_birthdate instanceof Date ? r.client_birthdate.toISOString().split('T')[0] : r.client_birthdate,
    serviceId: r.service_id, serviceName: r.service_name,
    preferredDate: r.preferred_date instanceof Date ? r.preferred_date.toISOString().split('T')[0] : r.preferred_date,
    preferredTime: r.preferred_time, notes: r.notes, status: r.status, createdAt: r.created_at,
  };
}

router.get('/', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM booking_requests ORDER BY created_at DESC');
    res.json(rows.map(mapReq));
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erro interno do servidor.' }); }
});

router.post('/', bookingLimit, async (req, res) => {
  try {
    const { clientName, clientPhone, serviceName, preferredDate, preferredTime } = req.body;
    if (!clientName?.trim() || !clientPhone?.trim() || !serviceName?.trim() || !preferredDate || !preferredTime) {
      return res.status(400).json({ error: 'Campos obrigatórios: nome, telefone, serviço, data e horário.' });
    }
    if (clientName.length > 100) return res.status(400).json({ error: 'Nome muito longo.' });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(preferredDate)) {
      return res.status(400).json({ error: 'Data inválida. Use o formato YYYY-MM-DD.' });
    }
    if (!/^\d{2}:\d{2}$/.test(preferredTime)) {
      return res.status(400).json({ error: 'Horário inválido. Use o formato HH:MM.' });
    }

    const { clientEmail, clientWhatsapp, clientBirthdate, serviceId, notes } = req.body;
    if (clientEmail && !/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(clientEmail.trim())) {
      return res.status(400).json({ error: 'Email inválido.' });
    }
    if (String(clientPhone).length > 30) return res.status(400).json({ error: 'Telefone muito longo.' });
    if (clientBirthdate && !/^\d{4}-\d{2}-\d{2}$/.test(clientBirthdate)) {
      return res.status(400).json({ error: 'Data de nascimento inválida. Use o formato YYYY-MM-DD.' });
    }
    const id = uuid();
    await db.query(
      `INSERT INTO booking_requests (id, client_name, client_email, client_phone, client_whatsapp, client_birthdate, service_id, service_name, preferred_date, preferred_time, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, clientName.trim(), clientEmail?.trim() || null, clientPhone.trim(), clientWhatsapp?.trim() || null, clientBirthdate || null, serviceId || null, serviceName.trim(), preferredDate, preferredTime, notes?.trim() || null]
    );

    // Cadastra o cliente automaticamente se ainda não existir (pelo telefone)
    const [existing] = await db.query('SELECT id FROM clients WHERE phone = ? LIMIT 1', [clientPhone.trim()]);
    if (!existing.length) {
      const clientId = uuid();
      await db.query(
        `INSERT INTO clients (id, name, email, phone, whatsapp, birthdate, source) VALUES (?, ?, ?, ?, ?, ?, 'website')`,
        [clientId, clientName.trim(), clientEmail?.trim() || null, clientPhone.trim(), clientWhatsapp?.trim() || null, clientBirthdate || null]
      );
    }

    const [rows] = await db.query('SELECT * FROM booking_requests WHERE id = ?', [id]);
    res.status(201).json(mapReq(rows[0]));
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erro interno do servidor.' }); }
});

router.patch('/:id/status', requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!VALID_BOOKING_STATUS.has(status)) {
      return res.status(400).json({ error: 'Status inválido.' });
    }
    await db.query('UPDATE booking_requests SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erro interno do servidor.' }); }
});

module.exports = router;
