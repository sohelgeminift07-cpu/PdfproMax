// Local / self-hosted dev server. Not used by Vercel (Vercel serves
// index.html as a static file and runs api/*.js as serverless functions
// directly) — this is only for `npm start` / `node server.js` on your own
// machine or a Node host such as Replit/Railway/Render.
const express = require('express');
const path = require('path');
const https = require('https');

const app = express();
app.use(express.json({ limit: '50mb' }));

function getApiKey() {
  const raw = process.env.GEMINI_API_KEY || '';
  return raw.split(',').map((k) => k.trim()).filter(Boolean)[0] || '';
}

// Proxy: POST /api/gemini/:model/generateContent
app.post('/api/gemini/:model/generateContent', async (req, res) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
  }

  const model = req.params.model;
  const body = JSON.stringify(req.body);

  const options = {
    hostname: 'generativelanguage.googleapis.com',
    path: `/v1beta/models/${model}:generateContent`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'x-goog-api-key': apiKey,
    },
  };

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

// Endpoint for the Live Audio WebSocket token
app.get('/api/gemini-ws-token', (req, res) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
  }
  res.json({ key: apiKey });
});

// Serve static files from root
app.use(express.static(path.join(__dirname, '.')));

// SPA fallback — serve index.html for any unmatched route
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`MaxOfPdf server running on http://localhost:${PORT}`);
});
