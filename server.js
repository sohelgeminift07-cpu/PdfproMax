// Local / self-hosted dev server. Not used by Vercel (Vercel serves
// index.html as a static file and runs api/*.js as serverless functions
// directly) — this is only for `npm start` / `node server.js` on your own
// machine or a Node host such as Replit/Railway/Render.
const express = require('express');
const path = require('path');
const https = require('https');
const http = require('http');
const WebSocket = require('ws');
const url = require('url');

const app = express();
const server = http.createServer(app);

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
    path: `/v1beta/models/${model}:generateContent?key=${apiKey}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
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

// Serve static files from root
app.use(express.static(path.join(__dirname, '.')));

// SPA fallback — serve index.html for any unmatched route
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// WebSocket proxy for Gemini Live API
const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws, req, geminiWs) => {
  console.log('Client connected to Gemini WebSocket proxy');

  ws.on('message', (message) => {
    if (geminiWs.readyState === WebSocket.OPEN) {
      geminiWs.send(message);
    }
  });

  geminiWs.on('message', (message) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  });

  ws.on('close', (code, reason) => {
    console.log(`Client disconnected from proxy: ${code} ${reason}`);
    geminiWs.close();
  });

  geminiWs.on('close', (code, reason) => {
    console.log(`Gemini disconnected from proxy: ${code} ${reason}`);
    ws.close();
  });

  ws.on('error', (err) => {
    console.error('Client WS error:', err);
    geminiWs.close();
  });

  geminiWs.on('error', (err) => {
    console.error('Gemini WS error:', err);
    ws.close();
  });
});

server.on('upgrade', (request, socket, head) => {
  const pathname = url.parse(request.url).pathname;

  if (pathname === '/api/gemini-ws') {
    const apiKey = getApiKey();
    if (!apiKey) {
      socket.write('HTTP/1.1 500 Internal Server Error\r\n\r\n');
      socket.destroy();
      return;
    }

    const geminiUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${apiKey}`;
    const geminiWs = new WebSocket(geminiUrl);

    // Wait for Gemini connection to be established before upgrading client
    geminiWs.on('open', () => {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request, geminiWs);
      });
    });

    geminiWs.on('error', (err) => {
      console.error('Failed to connect to Gemini:', err);
      socket.write('HTTP/1.1 502 Bad Gateway\r\n\r\n');
      socket.destroy();
    });
  } else {
    // Let other handlers or express handle it (though usually Express doesn't handle upgrades)
    socket.destroy();
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`MaxOfPdf server running on http://localhost:${PORT}`);
});
