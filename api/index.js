const express = require('express');

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

/* ── Environment Variables ── */
const GEMINI_KEYS = process.env.GEMINI_KEYS
  ? process.env.GEMINI_KEYS.split(',').map(k => k.trim()).filter(Boolean)
  : [];

const GEMINI_KEY_2 = process.env.GEMINI_KEY_2 || '';
const GEMINI_KEY_3 = process.env.GEMINI_KEY_3 || '';
const GEMINI_KEY_4 = process.env.GEMINI_KEY_4 || '';

if (GEMINI_KEY_2) GEMINI_KEYS.push(GEMINI_KEY_2);
if (GEMINI_KEY_3) GEMINI_KEYS.push(GEMINI_KEY_3);
if (GEMINI_KEY_4) GEMINI_KEYS.push(GEMINI_KEY_4);

let geminiKeyIndex = 0;
function nextGeminiKey() {
  const key = GEMINI_KEYS[geminiKeyIndex % GEMINI_KEYS.length];
  geminiKeyIndex++;
  return key;
}

/* ── Config / Health Check ── */
app.get('/api/config', (req, res) => {
  res.json({
    hasGemini: GEMINI_KEYS.length > 0,
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/* ── Gemini Proxy ── */
const MODEL_MAP = {
  'gemini-lite': 'gemini-2.5-flash',
  'gemini-flash': 'gemini-2.5-flash',
  'gemini-pro': 'gemini-2.5-flash',
};

app.post('/api/gemini/:model/generateContent', async (req, res) => {
  const rawModel = req.params.model;
  const model = MODEL_MAP[rawModel] || rawModel;

  let lastError = null;
  for (let i = 0; i < GEMINI_KEYS.length; i++) {
    const apiKey = nextGeminiKey();
    if (!apiKey) break;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
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
      console.error('[Gemini Proxy] Error:', err.message);
      lastError = { error: err.message };
      continue;
    }
  }

  if (lastError) {
    res.status(lastError.status || 500).json(lastError.data || { error: lastError.error || 'All Gemini keys failed' });
  } else {
    res.status(500).json({ error: 'No Gemini API key configured' });
  }
});

/* ── Gemini WS Token (for Live Audio) ── */
app.get('/api/gemini-ws-token', (req, res) => {
  const key = nextGeminiKey();
  if (!key) {
    console.error('[Gemini WS Token] No key configured');
    return res.status(500).json({ error: 'No Gemini API key configured' });
  }
  res.json({ key });
});

const handler = (req, res) => app(req, res);

handler.config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

module.exports = handler;
