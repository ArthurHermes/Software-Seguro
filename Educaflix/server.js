const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;
const USERS_FILE = path.join(ROOT_DIR, "data", "usuarios.json");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

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

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8"
  });
  res.end(JSON.stringify(payload));
}

function serveFile(req, res) {
  const requestedPath = req.url === "/" ? "/index.html" : req.url;
  const safePath = path.normalize(requestedPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(ROOT_DIR, safePath);

  fs.readFile(filePath, (error, content) => {
    if (error) {
      sendJson(res, 404, { erro: "Arquivo não encontrado." });
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": MIME_TYPES[extension] || "application/octet-stream"
    });
    res.end(content);
  });
}

function handleCadastro(req, res) {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk;
  });

  req.on("end", () => {
    try {
      const payload = JSON.parse(body || "{}");
      const nome = sanitizeText(payload.nome);
      const email = sanitizeText(payload.email).toLowerCase();
      const senha = String(payload.senha || "");
      const confirmarSenha = String(payload.confirmar_senha || "");

      if (!nome || !email || !senha || !confirmarSenha) {
        sendJson(res, 400, { erro: "Preencha todos os campos." });
        return;
      }

      if (senha !== confirmarSenha) {
        sendJson(res, 400, { erro: "As senhas não coincidem." });
        return;
      }

      const users = readUsers();
      users.push({ nome, email });
      writeUsers(users);

      sendJson(res, 201, {
        mensagem: "Cadastro realizado com sucesso.",
        usuario: { nome, email }
      });
    } catch (error) {
      sendJson(res, 400, { erro: "Requisição inválida." });
    }
  });
}

ensureDataFile();

http
  .createServer((req, res) => {
    if (req.method === "POST" && req.url === "/api/cadastro") {
      handleCadastro(req, res);
      return;
    }

    if (req.method === "GET") {
      serveFile(req, res);
      return;
    }

    sendJson(res, 405, { erro: "Método não permitido." });
  })
  .listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
