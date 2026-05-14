const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { hashPassword } = require("../services/passwordService");

const DATA_DIR = path.join(__dirname, "..", "..", "data");
const DB_FILE = path.join(DATA_DIR, "database.json");

const initialVideos = [
  {
    id: "video-html-semantico",
    titulo: "HTML Semantico para Iniciantes",
    descricao: "Aprenda a estruturar paginas acessiveis usando tags semanticas.",
    categoria: "Programacao",
    tema: "HTML",
    nivel: "basico",
    duracaoMinutos: 18,
    link: "https://www.youtube.com/watch?v=UB1O30fR-EE",
    status: "ativo",
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString()
  },
  {
    id: "video-logica-js",
    titulo: "Logica de Programacao com JavaScript",
    descricao: "Conceitos de variaveis, condicionais e repeticao aplicados em JavaScript.",
    categoria: "Programacao",
    tema: "JavaScript",
    nivel: "basico",
    duracaoMinutos: 32,
    link: "https://www.youtube.com/watch?v=Ptbk2af68e8",
    status: "ativo",
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString()
  },
  {
    id: "video-seguranca-web",
    titulo: "Fundamentos de Seguranca Web",
    descricao: "Introducao a autenticacao, autorizacao, validacao e protecao de sessoes.",
    categoria: "Ciberseguranca",
    tema: "Seguranca Web",
    nivel: "intermediario",
    duracaoMinutos: 45,
    link: "https://www.youtube.com/watch?v=2_lswM1S264",
    status: "ativo",
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString()
  }
];

function defaultDatabase() {
  const adminPassword = hashPassword("Admin@12345");
  const userPassword = hashPassword("Aluno@12345");

  return {
    users: [
      {
        id: crypto.randomUUID(),
        nome: "Administrador EducaFlix",
        email: "admin@educaflix.local",
        senhaHash: adminPassword.hash,
        senhaSalt: adminPassword.salt,
        role: "admin",
        status: "ativo",
        criadoEm: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        nome: "Aluno Demo",
        email: "aluno@educaflix.local",
        senhaHash: userPassword.hash,
        senhaSalt: userPassword.salt,
        role: "usuario",
        status: "ativo",
        criadoEm: new Date().toISOString()
      }
    ],
    videos: initialVideos,
    reviews: [],
    sessions: [],
    loginAttempts: [],
    loginAttemptLogs: []
  };
}

function initializeDatabase() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    writeDatabase(defaultDatabase());
    return;
  }

  const db = readDatabase();
  let changed = false;

  for (const key of ["users", "videos", "reviews", "sessions", "loginAttempts", "loginAttemptLogs"]) {
    if (!Array.isArray(db[key])) {
      db[key] = [];
      changed = true;
    }
  }

  if (db.videos.length === 0) {
    db.videos = initialVideos;
    changed = true;
  }

  if (changed) {
    writeDatabase(db);
  }
}

function readDatabase() {
  initializeDirectory();
  return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
}

function writeDatabase(database) {
  initializeDirectory();
  fs.writeFileSync(DB_FILE, JSON.stringify(database, null, 2), "utf8");
}

function initializeDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

module.exports = {
  DB_FILE,
  initializeDatabase,
  readDatabase,
  writeDatabase
};
