const { createServer } = require("./src/app");
const { initializeDatabase } = require("./src/database/jsonDatabase");

const PORT = process.env.PORT || 3333;

initializeDatabase();

createServer().listen(PORT, () => {
  console.log(`Backend EducaFlix rodando em http://localhost:${PORT}`);
});
