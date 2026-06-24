const express = require('express');
const path = require('path');

const app = express();

// Static files from project root
app.use(express.static(path.join(__dirname)));

// Import and mount API routes
const apiApp = require('./api/index.js');
app.use('/api', apiApp);

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Only listen in development
if (process.env.NODE_ENV !== 'production' || require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
