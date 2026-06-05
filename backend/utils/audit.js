const db        = require('../db');
const { v4: uuid } = require('uuid');

module.exports = async function audit(adminUser, action, resource, resourceId = null) {
  try {
    await db.query(
      'INSERT INTO audit_logs (id, user_id, user_email, action, resource, resource_id) VALUES (?, ?, ?, ?, ?, ?)',
      [uuid(), adminUser.id, adminUser.email, action, resource, resourceId || null]
    );
  } catch (e) {
    console.error('Audit log error:', e.message);
  }
};
