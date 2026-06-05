module.exports = function rateLimit({
  windowMs = 60_000,
  max = 10,
  message = 'Muitas requisições. Tente novamente mais tarde.',
} = {}) {
  const store = new Map();

  setInterval(() => {
    const now = Date.now();
    for (const [key, rec] of store) {
      if (now > rec.resetAt) store.delete(key);
    }
  }, windowMs).unref();

  return (req, res, next) => {
    const key = req.ip || 'unknown';
    const now = Date.now();
    const rec = store.get(key) || { count: 0, resetAt: now + windowMs };

    if (now > rec.resetAt) {
      rec.count = 0;
      rec.resetAt = now + windowMs;
    }

    rec.count++;
    store.set(key, rec);

    if (rec.count > max) return res.status(429).json({ error: message });
    next();
  };
};
