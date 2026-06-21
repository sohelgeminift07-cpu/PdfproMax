export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const model = req.query.model;
  const GEMINI_KEYS = process.env.GEMINI_KEYS
    ? process.env.GEMINI_KEYS.split(',')
    : [];

  if (!GEMINI_KEYS.length) {
    return res.status(500).json({ error: 'No Gemini API key configured' });
  }

  let lastError = null;

  for (let i = 0; i < GEMINI_KEYS.length; i++) {
    const apiKey = GEMINI_KEYS[i % GEMINI_KEYS.length].trim();
    if (!apiKey) continue;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    try {
      const upstream = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
      });

      const data = await upstream.json();

      if (upstream.ok) return res.status(200).json(data);

      // Rate limit or key error — try next key
      if ([429, 400, 403].includes(upstream.status)) {
        lastError = { status: upstream.status, data };
        continue;
      }

      // Other errors (e.g. 404 model not found) — return immediately
      return res.status(upstream.status).json(data);
    } catch (err) {
      lastError = { status: 500, data: { error: err.message } };
      continue;
    }
  }

  const s = lastError ? lastError.status || 500 : 500;
  const d = lastError ? lastError.data || {} : { error: 'All keys failed' };
  return res.status(s).json(d);
}
