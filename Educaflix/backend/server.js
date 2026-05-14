const { createServer } = require("./src/app");
const { initializeDatabase } = require("./src/database/jsonDatabase");
const { startLoginAttemptCleanup } = require("./src/services/loginAttemptService");

const PORT = process.env.PORT || 3333;

initializeDatabase();
startLoginAttemptCleanup();

createServer().listen(PORT, () => {
  console.log(`Backend EducaFlix rodando em http://localhost:${PORT}`);
});
