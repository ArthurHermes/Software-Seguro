const { createServer } = require("./src/app");
const { initializeDatabase } = require("./src/database/sqliteDatabase");
const { startLoginAttemptCleanup } = require("./src/services/loginAttemptService");

const PORT = process.env.PORT || 3333;

initializeDatabase();
startLoginAttemptCleanup();

createServer().listen(PORT, () => {
  console.log(`Backend EducaFlix rodando em http://localhost:${PORT}`);
});
