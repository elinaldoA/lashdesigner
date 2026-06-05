const express      = require('express');
const cors         = require('cors');
const path         = require('path');
const helmet       = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit    = require('./middleware/rateLimit');
require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === 'production';

// ─── Middlewares ──────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:  ["'self'"],
      scriptSrc:   ["'self'"],
      styleSrc:    ["'self'", "'unsafe-inline'"], // unsafe-inline necessário para recharts/SVG inline styles
      imgSrc:      ["'self'", 'data:', 'https:'],
      connectSrc:  ["'self'"],
      fontSrc:     ["'self'", 'https:', 'data:'],
      frameAncestors: ["'none'"],
      frameSrc:    ['https://maps.google.com', 'https://www.google.com'],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

// CORS com whitelist explícita de origens permitidas
const allowedOrigins = isProd
  ? [process.env.FRONTEND_URL].filter(Boolean)
  : [process.env.FRONTEND_URL || 'http://localhost:5173'];

if (isProd && allowedOrigins.length === 0) {
  console.error('❌ FRONTEND_URL não definida em produção. Configure a variável de ambiente.');
  process.exit(1);
}

app.use(cors({
  origin: (origin, callback) => {
    // Requests without Origin (same-origin via Vite proxy, curl, etc.) are allowed.
    // Requests from a cross-origin source must be in the whitelist.
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Origem não permitida pelo CORS.'));
  },
  credentials: true,
}));

app.use(cookieParser());

// Rejeita requisições com Content-Length excessivo antes de parsear o body
app.use((req, res, next) => {
  const len = parseInt(req.headers['content-length'] || '0', 10);
  if (len > 100 * 1024) return res.status(413).json({ error: 'Requisição muito grande.' });
  next();
});

app.use(express.json({ limit: '10kb' }));

// Rate limit global: 300 req/min por IP para todas as rotas da API
const globalApiLimit = rateLimit({ windowMs: 60_000, max: 300, message: 'Muitas requisições. Tente novamente em um minuto.' });
app.use('/api', globalApiLimit);

// ─── Rotas API ────────────────────────────────────────────────
app.use('/api/auth',             require('./routes/auth'));
app.use('/api/stats',            require('./routes/stats'));
app.use('/api/clients',          require('./routes/clients'));
app.use('/api/services',         require('./routes/services'));
app.use('/api/appointments',     require('./routes/appointments'));
app.use('/api/blocked-slots',    require('./routes/blockedSlots'));
app.use('/api/products',         require('./routes/products'));
app.use('/api/sales',            require('./routes/sales'));
app.use('/api/transactions',     require('./routes/transactions'));
app.use('/api/testimonials',     require('./routes/testimonials'));
app.use('/api/gallery',          require('./routes/gallery'));
app.use('/api/contact-messages', require('./routes/contactMessages'));
app.use('/api/booking-requests', require('./routes/bookingRequests'));
app.use('/api/site-content',     require('./routes/siteContent'));
app.use('/api/store',            require('./routes/storePublic'));
app.use('/api/store-orders',     require('./routes/storeOrders'));

// ─── Health check ─────────────────────────────────────────────
app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

// ─── Serve frontend em produção ───────────────────────────────
if (isProd) {
  const distPath = path.join(__dirname, '../dist');
  app.use(express.static(distPath));
  // Todas as rotas não-API retornam o index.html (SPA)
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// ─── Error handler ────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor.' });
});

app.listen(PORT, () => {
  const mode = isProd ? '🏭 PRODUÇÃO' : '🔧 DESENVOLVIMENTO';
  console.log(`🚀 Servidor ${mode} rodando em http://localhost:${PORT}`);
  if (isProd) console.log(`   Frontend servido em http://localhost:${PORT}`);
});
