// This file is for local development only
// Vercel uses api/index.js as the serverless function

if (require.main === module) {
  const express = require('express');
  const path = require('path');
  const app = express();

  app.use(express.static(path.join(__dirname)));
  const apiApp = require('./api/index.js');
  app.use('/api', apiApp);
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}
