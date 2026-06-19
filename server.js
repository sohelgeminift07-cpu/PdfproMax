// Secure backend proxy for MaxOfPdf
// All AI API calls go through the server so keys never reach the browser

const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: '10mb' }));

// ── Environment-based API keys (never exposed to client) ──
const GEMINI_KEYS = (process.env.GEMINI_API_KEY || '').split(',').map(k => k.trim()).filter(Boolean);
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const MAVERICK_KEY = process.env.GROQ_API_KEY || ''; // same pool for Groq

let geminiKeyIndex = 0;
function getGeminiKey() {
  if (GEMINI_KEYS.length === 0) return '';
  const key = GEMINI_KEYS[geminiKeyIndex];
  geminiKeyIndex = (geminiKeyIndex + 1) % GEMINI_KEYS.length;
  return key;
}

// ── CORS for Replit preview ──
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ── Gemini proxy with key rotation ──
app.post('/api/proxy/gemini', async (req, res) => {
  const { model, contents, config } = req.body;
  if (GEMINI_KEYS.length === 0) {
    return res.status(500).json({ error: 'Gemini API key not configured on server' });
  }

  const buildBody = () => {
    const body = {
      contents: Array.isArray(contents)
        ? contents.map(c => (typeof c === 'string' ? { parts: [{ text: c }], role: 'user' } : c))
        : [{ parts: [{ text: contents }], role: 'user' }],
      generationConfig: { maxOutputTokens: config?.maxOutputTokens || 8192 }
    };
    if (config?.systemInstruction) {
      body.systemInstruction = { parts: [{ text: config.systemInstruction }] };
    }
    if (config?.temperature !== undefined) {
      body.generationConfig.temperature = config.temperature;
    }
    if (config?.responseMimeType) {
      body.generationConfig.responseMimeType = config.responseMimeType;
    }
    if (config?.responseModalities) {
      body.generationConfig.responseModalities = config.responseModalities;
    }
    if (config?.speechConfig) {
      body.generationConfig.speechConfig = config.speechConfig;
    }
    return body;
  };

  const body = buildBody();
  const startIndex = geminiKeyIndex;
  let lastError = null;

  for (let i = 0; i < GEMINI_KEYS.length; i++) {
    const key = getGeminiKey();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await resp.json();
      if (resp.ok) {
        return res.json(data);
      }
      // Rate limit or key error — try next key
      lastError = data;
      console.warn(`Gemini key ${(i + 1)} failed (${resp.status}), rotating...`);
      if (resp.status !== 429 && resp.status !== 403) {
        // Non-retryable error
        return res.status(resp.status).json(data);
      }
    } catch (e) {
      lastError = e.message;
      console.error(`Gemini key ${(i + 1)} network error:`, e.message);
    }
  }

  console.error('All Gemini keys exhausted');
  res.status(429).json({ error: 'All Gemini API keys rate-limited or failed', detail: lastError });
});

// ── Groq proxy ──
app.post('/api/proxy/groq', async (req, res) => {
  const body = req.body;
  const key = GROQ_API_KEY;
  if (!key) {
    return res.status(500).json({ error: 'Groq API key not configured on server' });
  }
  try {
    const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify(body)
    });
    const data = await resp.json();
    if (!resp.ok) {
      return res.status(resp.status).json(data);
    }
    res.json(data);
  } catch (e) {
    console.error('Groq proxy error:', e);
    res.status(500).json({ error: e.message });
  }
});

// ── Serve static files ──
app.use(express.static(path.join(__dirname)));

// SPA fallback
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`MaxOfPdf server running on port ${PORT}`);
});
