const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const Database = require("better-sqlite3");
const { hashPassword } = require("../services/passwordService");

const DATA_DIR = path.join(__dirname, "..", "..", "data");
const DB_FILE = resolveDatabaseFile(process.env.EDUCAFLIX_DB_FILE);
const LEGACY_JSON_FILE = path.join(DATA_DIR, "database.json");

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

let databaseInstance = null;

function resolveDatabaseFile(configuredPath) {
  if (!configuredPath) return path.join(DATA_DIR, "database.sqlite");
  if (path.isAbsolute(configuredPath)) return configuredPath;
  return path.resolve(path.join(__dirname, "..", ".."), configuredPath);
}

function getDatabase() {
  initializeDirectory();

  if (!databaseInstance) {
    databaseInstance = new Database(DB_FILE);
    databaseInstance.pragma("journal_mode = WAL");
    databaseInstance.pragma("foreign_keys = ON");
  }

  return databaseInstance;
}

function initializeDatabase() {
  const db = getDatabase();
  createSchema(db);

  if (countRows(db, "users") === 0 && fs.existsSync(LEGACY_JSON_FILE)) {
    importLegacyJson(db);
  }

  seedDefaults(db);
}

function createSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      senha_hash TEXT NOT NULL,
      senha_salt TEXT NOT NULL,
      role TEXT NOT NULL,
      status TEXT NOT NULL,
      criado_em TEXT NOT NULL,
      atualizado_em TEXT
    );

    CREATE TABLE IF NOT EXISTS videos (
      id TEXT PRIMARY KEY,
      titulo TEXT NOT NULL,
      descricao TEXT NOT NULL,
      categoria TEXT NOT NULL,
      tema TEXT NOT NULL,
      nivel TEXT NOT NULL,
      duracao_minutos INTEGER NOT NULL,
      link TEXT NOT NULL,
      status TEXT NOT NULL,
      criado_em TEXT NOT NULL,
      atualizado_em TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      video_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      nota INTEGER NOT NULL,
      comentario TEXT NOT NULL,
      criado_em TEXT NOT NULL,
      atualizado_em TEXT NOT NULL,
      FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      csrf_token TEXT NOT NULL,
      user_id TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      invalidated INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS login_attempts (
      key TEXT PRIMARY KEY,
      scope TEXT NOT NULL,
      identifier TEXT NOT NULL,
      count INTEGER NOT NULL,
      first_attempt_at TEXT NOT NULL,
      last_attempt_at TEXT NOT NULL,
      locked_until TEXT
    );

    CREATE TABLE IF NOT EXISTS login_attempt_logs (
      id TEXT PRIMARY KEY,
      email TEXT,
      ip TEXT NOT NULL,
      outcome TEXT NOT NULL,
      reason TEXT NOT NULL,
      occurred_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_reviews_video_id ON reviews(video_id);
    CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_login_logs_occurred_at ON login_attempt_logs(occurred_at);
  `);
}

function seedDefaults(db) {
  if (countRows(db, "users") === 0) {
    const adminPassword = hashPassword("Admin@12345");
    const userPassword = hashPassword("Aluno@12345");
    const insertUser = db.prepare(`
      INSERT INTO users (id, nome, email, senha_hash, senha_salt, role, status, criado_em, atualizado_em)
      VALUES (@id, @nome, @email, @senha_hash, @senha_salt, @role, @status, @criado_em, @atualizado_em)
    `);

    insertUser.run({
      id: crypto.randomUUID(),
      nome: "Administrador EducaFlix",
      email: "admin@educaflix.local",
      senha_hash: adminPassword.hash,
      senha_salt: adminPassword.salt,
      role: "admin",
      status: "ativo",
      criado_em: new Date().toISOString(),
      atualizado_em: null
    });

    insertUser.run({
      id: crypto.randomUUID(),
      nome: "Aluno Demo",
      email: "aluno@educaflix.local",
      senha_hash: userPassword.hash,
      senha_salt: userPassword.salt,
      role: "usuario",
      status: "ativo",
      criado_em: new Date().toISOString(),
      atualizado_em: null
    });
  }

  if (countRows(db, "videos") === 0) {
    const insertVideo = db.prepare(`
      INSERT INTO videos (
        id, titulo, descricao, categoria, tema, nivel, duracao_minutos, link, status, criado_em, atualizado_em
      ) VALUES (
        @id, @titulo, @descricao, @categoria, @tema, @nivel, @duracao_minutos, @link, @status, @criado_em, @atualizado_em
      )
    `);

    for (const video of initialVideos) {
      insertVideo.run(videoToRow(video));
    }
  }
}

function importLegacyJson(db) {
  let parsed;

  try {
    parsed = JSON.parse(fs.readFileSync(LEGACY_JSON_FILE, "utf8"));
  } catch (error) {
    return;
  }

  const transaction = db.transaction(() => {
    const insertUser = db.prepare(`
      INSERT OR IGNORE INTO users (id, nome, email, senha_hash, senha_salt, role, status, criado_em, atualizado_em)
      VALUES (@id, @nome, @email, @senha_hash, @senha_salt, @role, @status, @criado_em, @atualizado_em)
    `);
    const insertVideo = db.prepare(`
      INSERT OR IGNORE INTO videos (
        id, titulo, descricao, categoria, tema, nivel, duracao_minutos, link, status, criado_em, atualizado_em
      ) VALUES (
        @id, @titulo, @descricao, @categoria, @tema, @nivel, @duracao_minutos, @link, @status, @criado_em, @atualizado_em
      )
    `);
    const insertReview = db.prepare(`
      INSERT OR IGNORE INTO reviews (id, video_id, user_id, nota, comentario, criado_em, atualizado_em)
      VALUES (@id, @video_id, @user_id, @nota, @comentario, @criado_em, @atualizado_em)
    `);
    const insertSession = db.prepare(`
      INSERT OR IGNORE INTO sessions (token, csrf_token, user_id, expires_at, invalidated)
      VALUES (@token, @csrf_token, @user_id, @expires_at, @invalidated)
    `);
    const insertAttempt = db.prepare(`
      INSERT OR REPLACE INTO login_attempts (
        key, scope, identifier, count, first_attempt_at, last_attempt_at, locked_until
      ) VALUES (
        @key, @scope, @identifier, @count, @first_attempt_at, @last_attempt_at, @locked_until
      )
    `);
    const insertLog = db.prepare(`
      INSERT OR IGNORE INTO login_attempt_logs (id, email, ip, outcome, reason, occurred_at)
      VALUES (@id, @email, @ip, @outcome, @reason, @occurred_at)
    `);

    for (const user of parsed.users || []) insertUser.run(userToRow(user));
    for (const video of parsed.videos || []) insertVideo.run(videoToRow(video));
    for (const review of parsed.reviews || []) insertReview.run(reviewToRow(review));
    for (const session of parsed.sessions || []) insertSession.run(sessionToRow(session));
    for (const attempt of parsed.loginAttempts || []) insertAttempt.run(loginAttemptToRow(attempt));
    for (const log of parsed.loginAttemptLogs || []) insertLog.run(loginAttemptLogToRow(log));
  });

  transaction();
}

function readDatabase() {
  const db = getDatabase();

  return {
    users: db.prepare("SELECT * FROM users ORDER BY criado_em ASC").all().map(rowToUser),
    videos: db.prepare("SELECT * FROM videos ORDER BY criado_em ASC").all().map(rowToVideo),
    reviews: db.prepare("SELECT * FROM reviews ORDER BY criado_em ASC").all().map(rowToReview),
    sessions: db.prepare("SELECT * FROM sessions ORDER BY expires_at ASC").all().map(rowToSession),
    loginAttempts: db.prepare("SELECT * FROM login_attempts ORDER BY first_attempt_at ASC").all().map(rowToLoginAttempt),
    loginAttemptLogs: db.prepare("SELECT * FROM login_attempt_logs ORDER BY occurred_at ASC").all().map(rowToLoginAttemptLog)
  };
}

function closeDatabase() {
  if (databaseInstance) {
    databaseInstance.close();
    databaseInstance = null;
  }
}

function initializeDirectory() {
  const directory = path.dirname(DB_FILE);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

function countRows(db, table) {
  return db.prepare(`SELECT COUNT(*) AS total FROM ${table}`).get().total;
}

function rowToUser(row) {
  return {
    id: row.id,
    nome: row.nome,
    email: row.email,
    senhaHash: row.senha_hash,
    senhaSalt: row.senha_salt,
    role: row.role,
    status: row.status,
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em
  };
}

function rowToVideo(row) {
  return {
    id: row.id,
    titulo: row.titulo,
    descricao: row.descricao,
    categoria: row.categoria,
    tema: row.tema,
    nivel: row.nivel,
    duracaoMinutos: row.duracao_minutos,
    link: row.link,
    status: row.status,
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em
  };
}

function rowToReview(row) {
  return {
    id: row.id,
    videoId: row.video_id,
    userId: row.user_id,
    nota: row.nota,
    comentario: row.comentario,
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em
  };
}

function rowToSession(row) {
  return {
    token: row.token,
    csrfToken: row.csrf_token,
    userId: row.user_id,
    expiresAt: row.expires_at,
    invalidated: Boolean(row.invalidated)
  };
}

function rowToLoginAttempt(row) {
  return {
    key: row.key,
    scope: row.scope,
    identifier: row.identifier,
    count: row.count,
    firstAttemptAt: row.first_attempt_at,
    lastAttemptAt: row.last_attempt_at,
    lockedUntil: row.locked_until
  };
}

function rowToLoginAttemptLog(row) {
  return {
    id: row.id,
    email: row.email,
    ip: row.ip,
    outcome: row.outcome,
    reason: row.reason,
    occurredAt: row.occurred_at
  };
}

function userToRow(user) {
  return {
    id: user.id,
    nome: user.nome,
    email: user.email,
    senha_hash: user.senhaHash,
    senha_salt: user.senhaSalt,
    role: user.role,
    status: user.status,
    criado_em: user.criadoEm,
    atualizado_em: user.atualizadoEm || null
  };
}

function videoToRow(video) {
  return {
    id: video.id,
    titulo: video.titulo,
    descricao: video.descricao,
    categoria: video.categoria,
    tema: video.tema,
    nivel: video.nivel,
    duracao_minutos: video.duracaoMinutos,
    link: video.link,
    status: video.status,
    criado_em: video.criadoEm,
    atualizado_em: video.atualizadoEm
  };
}

function reviewToRow(review) {
  return {
    id: review.id,
    video_id: review.videoId,
    user_id: review.userId,
    nota: review.nota,
    comentario: review.comentario,
    criado_em: review.criadoEm,
    atualizado_em: review.atualizadoEm
  };
}

function sessionToRow(session) {
  return {
    token: session.token,
    csrf_token: session.csrfToken,
    user_id: session.userId,
    expires_at: session.expiresAt,
    invalidated: session.invalidated ? 1 : 0
  };
}

function loginAttemptToRow(attempt) {
  return {
    key: attempt.key,
    scope: attempt.scope,
    identifier: attempt.identifier,
    count: attempt.count,
    first_attempt_at: attempt.firstAttemptAt,
    last_attempt_at: attempt.lastAttemptAt,
    locked_until: attempt.lockedUntil || null
  };
}

function loginAttemptLogToRow(log) {
  return {
    id: log.id,
    email: log.email,
    ip: log.ip,
    outcome: log.outcome,
    reason: log.reason,
    occurred_at: log.occurredAt
  };
}

module.exports = {
  DB_FILE,
  closeDatabase,
  getDatabase,
  initializeDatabase,
  readDatabase,
  rowToLoginAttempt,
  rowToLoginAttemptLog,
  rowToReview,
  rowToSession,
  rowToUser,
  rowToVideo
};
