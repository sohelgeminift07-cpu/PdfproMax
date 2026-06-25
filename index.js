const apiApp = require('./api/index.js');

const PORT = process.env.PORT || 3000;
apiApp.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
