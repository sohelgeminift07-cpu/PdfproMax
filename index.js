const express = require('express');
const path = require('path');

// Import the existing Express app (routes and middleware)
const apiApp = require('./api/index.js');

// Create a small wrapper Express app that mounts the existing app
const app = express();

// Static files from project root (so index.html, CSS, JS work)
app.use(express.static(path.join(__dirname)));

// Mount the existing API app under /api
app.use('/api', apiApp);

// Fallback: serve index.html for any non-API route (SPA behavior)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server (entrypoint) running on port ${PORT}`);
});
