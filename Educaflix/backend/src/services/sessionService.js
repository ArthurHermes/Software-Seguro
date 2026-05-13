const crypto = require("crypto");
const { readDatabase, writeDatabase } = require("../database/jsonDatabase");

const SESSION_TTL_MS = 1000 * 60 * 60 * 2;

function createSession(userId) {
  const db = readDatabase();
  const token = crypto.randomBytes(32).toString("hex");
  const csrfToken = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();

  db.sessions = db.sessions.filter((session) => session.expiresAt > new Date().toISOString());
  db.sessions.push({ token, csrfToken, userId, expiresAt, invalidated: false });
  writeDatabase(db);

  return { token, csrfToken, expiresAt };
}

function getSession(token) {
  if (!token) return null;

  const db = readDatabase();
  const session = db.sessions.find((item) => item.token === token && !item.invalidated);
  if (!session || session.expiresAt <= new Date().toISOString()) return null;

  return session;
}

function invalidateSession(token) {
  const db = readDatabase();
  db.sessions = db.sessions.map((session) =>
    session.token === token ? { ...session, invalidated: true } : session
  );
  writeDatabase(db);
}

function invalidateUserSessions(userId) {
  const db = readDatabase();
  db.sessions = db.sessions.map((session) =>
    session.userId === userId ? { ...session, invalidated: true } : session
  );
  writeDatabase(db);
}

module.exports = {
  createSession,
  getSession,
  invalidateSession,
  invalidateUserSessions
};
