const express = require('express');

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

/* ── Environment Variables ── */
const GEMINI_KEYS = (process.env.GEMINI_API_KEYS || '')
  .split(',')
  .map(k => k.trim())
  .filter(Boolean);

let geminiKeyIndex = 0;
function nextGeminiKey() {
  if (GEMINI_KEYS.length === 0) return null;
  const key = GEMINI_KEYS[geminiKeyIndex % GEMINI_KEYS.length];
  geminiKeyIndex++;
  return key;
}

/* ── Health Check ── */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/* ── Gemini Proxy ── */
app.post('/api/gemini/:model/generateContent', async (req, res) => {
  const model = req.params.model;

  let lastError = null;
  for (let i = 0; i < Math.max(GEMINI_KEYS.length, 1); i++) {
    const apiKey = nextGeminiKey();
    if (!apiKey) break;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    try {
      const upstream = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
      });
      const data = await upstream.json();
      if (upstream.ok) return res.status(200).json(data);
      if (upstream.status === 429 || upstream.status === 400 || upstream.status === 403) {
        lastError = { status: upstream.status, data };
        continue;
      }
      return res.status(upstream.status).json(data);
    } catch (err) {
      console.error('Gemini proxy error:', err.message);
      lastError = { error: err.message };
      continue;
    }
  }

  if (lastError) {
    res.status(lastError.status || 500).json(lastError.data || { error: lastError.error || 'All keys failed' });
  } else {
    res.status(500).json({ error: 'No Gemini API key configured' });
  }
});

module.exports = app;
