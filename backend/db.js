const mysql = require('mysql2/promise');
require('dotenv').config();

if (process.env.NODE_ENV === 'production') {
  ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'].forEach(key => {
    if (process.env[key] === undefined || process.env[key] === '') {
      console.error(`❌ [Produção] Variável de ambiente obrigatória não definida: ${key}`);
      process.exit(1);
    }
  });
} else {
  if (!process.env.DB_PASSWORD) {
    console.warn('⚠️  [Desenvolvimento] DB_PASSWORD está vazio. Defina uma senha no arquivo backend/.env antes de ir para produção.');
  }
}

const pool = mysql.createPool({
  host:              process.env.DB_HOST     || 'localhost',
  port:              parseInt(process.env.DB_PORT || '3306'),
  user:              process.env.DB_USER     || 'root',
  password:          process.env.DB_PASSWORD || '',
  database:          process.env.DB_NAME     || 'lash_designer',
  waitForConnections: true,
  connectionLimit:   10,
  charset:           'utf8mb4',
  timezone:          '-03:00',
});


// Testa a conexão e confirma charset na inicialização
pool.getConnection()
  .then(async conn => {
    await conn.query("SET NAMES 'utf8mb4' COLLATE 'utf8mb4_unicode_ci'");
    console.log('✅ MySQL conectado com sucesso! (charset: utf8mb4)');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Erro ao conectar ao MySQL:', err.message);
    process.exit(1);
  });

module.exports = pool;
