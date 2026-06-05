/**
 * Script de configuração do primeiro administrador.
 * Execute uma vez após criar o banco de dados:
 *   node backend/setup-admin.js
 */
const readline = require('readline');
const bcrypt   = require('bcryptjs');
const { v4: uuid } = require('uuid');
require('dotenv').config();

const db = require('./db');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(resolve => rl.question(q, resolve));

async function main() {
  console.log('\n=== Configuração do Administrador Lash Designer ===\n');

  const name  = (await ask('Nome completo: ')).trim();
  const email = (await ask('E-mail: ')).trim().toLowerCase();
  const pass1 = (await ask('Senha (mín. 8 caracteres): ')).trim();
  const pass2 = (await ask('Confirme a senha: ')).trim();

  if (!name || !email || !pass1) {
    console.error('❌ Todos os campos são obrigatórios.'); rl.close(); process.exit(1);
  }
  if (!/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(email)) {
    console.error('❌ E-mail inválido.'); rl.close(); process.exit(1);
  }
  if (pass1.length < 8) {
    console.error('❌ A senha deve ter pelo menos 8 caracteres.'); rl.close(); process.exit(1);
  }
  if (pass1 !== pass2) {
    console.error('❌ As senhas não coincidem.'); rl.close(); process.exit(1);
  }

  const [existing] = await db.query('SELECT id FROM admin_users WHERE email = ?', [email]);
  if (existing.length) {
    console.error('❌ Já existe um administrador com esse e-mail.'); rl.close(); process.exit(1);
  }

  const hash = await bcrypt.hash(pass1, 12);
  const id   = uuid();
  await db.query(
    'INSERT INTO admin_users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
    [id, name, email, hash, 'admin']
  );

  console.log(`\n✅ Administrador "${name}" criado com sucesso!`);
  console.log('   Acesse o painel com o e-mail e senha que você definiu.\n');
  rl.close();
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Erro:', err.message);
  rl.close();
  process.exit(1);
});
