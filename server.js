const express = require('express');
const path = require('path');
const https = require('https');

const app = express();
app.use(express.json({ limit: '50mb' }));

const GEMINI_API_KEY = process.env.AI_INTEGRATIONS_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
const GEMINI_BASE_URL = process.env.AI_INTEGRATIONS_GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com';

// Proxy: POST /api/gemini/:model/generateContent
app.post('/api/gemini/:model/generateContent', async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Gemini API key not configured' });
  }

  const model = req.params.model;
  const body = JSON.stringify(req.body);

  const apiVersion = process.env.AI_INTEGRATIONS_GEMINI_BASE_URL ? '' : 'v1beta';
  const urlPath = apiVersion
    ? `/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`
    : `/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

  const baseHost = GEMINI_BASE_URL.replace(/^https?:\/\//, '');

  const options = {
    hostname: baseHost,
    path: urlPath,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    },
  };

  if (process.env.AI_INTEGRATIONS_GEMINI_BASE_URL) {
    options.headers['x-goog-api-key'] = GEMINI_API_KEY;
  }

  const proxyReq = https.request(options, (proxyRes) => {
    res.status(proxyRes.statusCode);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err);
    res.status(502).json({ error: 'Proxy request failed', details: err.message });
  });

  proxyReq.write(body);
  proxyReq.end();
});

// Endpoint for WebSocket token (live audio)
app.get('/api/gemini-ws-token', (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Gemini API key not configured' });
  }
  res.json({ key: GEMINI_API_KEY });
});

// Serve static files from root
app.use(express.static(path.join(__dirname, '.')));

// SPA fallback — serve index.html for any unmatched route
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`MaxOfPdf server running on port ${PORT}`);
});
