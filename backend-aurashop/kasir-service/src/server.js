const app = require('./app');

const PORT = 4002;
app.listen(PORT, () => {
  console.log(`🧾 Kasir service running on http://localhost:${PORT}`);
});
