const crypto = require("crypto");
const { getDatabase, rowToSession } = require("../database/sqliteDatabase");

const SESSION_TTL_MS = 1000 * 60 * 60 * 2;

function createSession(userId) {
  const db = getDatabase();
  const token = crypto.randomBytes(32).toString("hex");
  const csrfToken = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
  const now = new Date().toISOString();

  db.prepare("DELETE FROM sessions WHERE expires_at <= ?").run(now);
  db.prepare(`
    INSERT INTO sessions (token, csrf_token, user_id, expires_at, invalidated)
    VALUES (?, ?, ?, ?, 0)
  `).run(token, csrfToken, userId, expiresAt);

  return { token, csrfToken, expiresAt };
}

function getSession(token) {
  if (!token) return null;

  const db = getDatabase();
  const row = db
    .prepare("SELECT * FROM sessions WHERE token = ? AND invalidated = 0 LIMIT 1")
    .get(token);
  if (!row) return null;
  const session = rowToSession(row);
  if (session.expiresAt <= new Date().toISOString()) return null;
  return session;
}

function invalidateSession(token) {
  const db = getDatabase();
  db.prepare("UPDATE sessions SET invalidated = 1 WHERE token = ?").run(token);
}

function invalidateUserSessions(userId) {
  const db = getDatabase();
  db.prepare("UPDATE sessions SET invalidated = 1 WHERE user_id = ?").run(userId);
}

module.exports = {
  createSession,
  getSession,
  invalidateSession,
  invalidateUserSessions
};
