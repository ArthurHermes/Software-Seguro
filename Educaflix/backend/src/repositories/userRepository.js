const { getDatabase, rowToUser } = require("../database/sqliteDatabase");

function publicUser(user) {
  if (!user) return null;
  const { senhaHash, senhaSalt, ...safeUser } = user;
  return safeUser;
}

function findAllUsers() {
  const db = getDatabase();
  return db.prepare("SELECT * FROM users ORDER BY criado_em ASC").all().map(rowToUser).map(publicUser);
}

function findUserByEmail(email) {
  const db = getDatabase();
  const row = db
    .prepare("SELECT * FROM users WHERE email = ? LIMIT 1")
    .get(String(email || "").toLowerCase());
  return row ? rowToUser(row) : null;
}

function findUserById(id) {
  const db = getDatabase();
  const row = db.prepare("SELECT * FROM users WHERE id = ? LIMIT 1").get(id);
  return row ? rowToUser(row) : null;
}

function createUser(user) {
  const db = getDatabase();
  db.prepare(`
    INSERT INTO users (id, nome, email, senha_hash, senha_salt, role, status, criado_em, atualizado_em)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    user.id,
    user.nome,
    user.email,
    user.senhaHash,
    user.senhaSalt,
    user.role,
    user.status,
    user.criadoEm,
    user.atualizadoEm || null
  );
  return publicUser(user);
}

function updateUserStatus(id, status) {
  const db = getDatabase();
  const result = db
    .prepare("UPDATE users SET status = ?, atualizado_em = ? WHERE id = ?")
    .run(status, new Date().toISOString(), id);
  if (result.changes === 0) return null;
  return publicUser(findUserById(id));
}

module.exports = {
  createUser,
  findAllUsers,
  findUserByEmail,
  findUserById,
  publicUser,
  updateUserStatus
};
