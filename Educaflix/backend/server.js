const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = process.env.PORT || 3333;
const USERS_FILE = path.join(__dirname, "data", "usuarios.json");
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "http://localhost:3000";

function ensureDataFile() {
  const dataDir = path.dirname(USERS_FILE);

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, "[]", "utf8");
  }
}

function sanitizeText(value) {
  return String(value || "")
    .replace(/<[^>]*>/g, "")
    .replace(/[<>]/g, "")
    .trim();
}

function readUsers() {
  ensureDataFile();
  return JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
}

function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function sendJson(res, statusCode, payload) {
  setCorsHeaders(res);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8"
  });
  res.end(JSON.stringify(payload));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;

      if (body.length > 1_000_000) {
        req.destroy();
        reject(new Error("Payload muito grande."));
      }
    });

    req.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch (error) {
        reject(error);
      }
    });

    req.on("error", reject);
  });
}

async function handleCadastro(req, res) {
  try {
    const payload = await readJsonBody(req);
    const nome = sanitizeText(payload.nome);
    const email = sanitizeText(payload.email).toLowerCase();
    const senha = String(payload.senha || "");
    const confirmarSenha = String(payload.confirmar_senha || "");

    if (!nome || !email || !senha || !confirmarSenha) {
      sendJson(res, 400, { erro: "Preencha todos os campos." });
      return;
    }

    if (senha !== confirmarSenha) {
      sendJson(res, 400, { erro: "As senhas nao coincidem." });
      return;
    }

    const users = readUsers();
    const emailAlreadyExists = users.some((user) => user.email === email);

    if (emailAlreadyExists) {
      sendJson(res, 409, { erro: "Este e-mail ja esta cadastrado." });
      return;
    }

    users.push({
      id: crypto.randomUUID(),
      nome,
      email,
      criadoEm: new Date().toISOString()
    });
    writeUsers(users);

    sendJson(res, 201, {
      mensagem: "Cadastro realizado com sucesso.",
      usuario: { nome, email }
    });
  } catch (error) {
    sendJson(res, 400, { erro: "Requisicao invalida." });
  }
}

ensureDataFile();

http
  .createServer((req, res) => {
    setCorsHeaders(res);

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.method === "GET" && req.url === "/api/health") {
      sendJson(res, 200, { status: "ok" });
      return;
    }

    if (req.method === "POST" && req.url === "/api/cadastro") {
      handleCadastro(req, res);
      return;
    }

    sendJson(res, 404, { erro: "Rota nao encontrada." });
  })
  .listen(PORT, () => {
    console.log(`Backend EducaFlix rodando em http://localhost:${PORT}`);
  });
