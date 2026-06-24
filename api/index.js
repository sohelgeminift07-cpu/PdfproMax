const express = require('express');
const path = require('path');

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '..')));

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

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const MAVERICK_KEY = process.env.MAVERICK_KEY || '';

let geminiKeyIndex = 0;
function nextGeminiKey() {
  const key = GEMINI_KEYS[geminiKeyIndex % GEMINI_KEYS.length];
  geminiKeyIndex++;
  return key;
}

/* ── Health / Config ── */
app.get('/api/config', (req, res) => {
  res.json({
    hasGemini: GEMINI_KEYS.length > 0,
    hasGroq: !!GROQ_API_KEY,
    hasMaverick: !!MAVERICK_KEY,
  });
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

/* ── Groq Proxy ──
   Auto-detects which key to use based on the model in the request body.
   Fallback: ?maverick=1 query param forces Maverick key.
   The server NEVER exposes keys to the browser.
*/
app.post('/api/groq', async (req, res) => {
  const body = req.body;
  const modelId = body.model || '';
  const isMaverick = modelId.includes('llama-4-maverick') || req.query.maverick === '1';
  const key = isMaverick ? MAVERICK_KEY : GROQ_API_KEY;

  if (!key) {
    console.error('Groq proxy: No API key configured (model=' + modelId + ', maverick=' + isMaverick + ')');
    return res.status(500).json({ error: 'No Groq API key configured' });
  }

  try {
    const upstream = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify(body),
    });
    const data = await upstream.json();
    if (!upstream.ok) {
      console.error('Groq proxy upstream error:', upstream.status, data);
    }
    res.status(upstream.status).json(data);
  } catch (err) {
    console.error('Groq proxy error:', err.message);
    res.status(500).json({ error: err.message, status: 500 });
  }
});

/* ── Gemini WS Token (for Live Audio) ── */
app.get('/api/gemini-ws-token', (req, res) => {
  const key = nextGeminiKey();
  if (!key) {
    console.error('Gemini WS token: No key configured');
    return res.status(500).json({ error: 'No Gemini API key configured' });
  }
  res.json({ key });
});

/* ── Local dev server (ignored by Vercel serverless) ── */
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production' || require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MaxOfPdf server running on port ${PORT}`);
  });
}

module.exports = app;
