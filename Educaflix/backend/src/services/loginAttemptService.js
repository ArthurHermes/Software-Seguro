const { readDatabase, writeDatabase } = require("../database/jsonDatabase");

const WINDOW_MS = 15 * 60 * 1000;
const LOCK_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function keyFor(email, ip) {
  return `${String(email || "").toLowerCase()}|${ip}`;
}

function getAttempt(email, ip) {
  const db = readDatabase();
  const key = keyFor(email, ip);
  const attempt = db.loginAttempts.find((item) => item.key === key);

  if (!attempt) return null;
  if (attempt.lockedUntil && new Date(attempt.lockedUntil).getTime() > Date.now()) return attempt;
  if (Date.now() - new Date(attempt.firstAttemptAt).getTime() <= WINDOW_MS) return attempt;

  db.loginAttempts = db.loginAttempts.filter((item) => item.key !== key);
  writeDatabase(db);
  return null;
}

function isBlocked(email, ip) {
  const attempt = getAttempt(email, ip);
  return Boolean(attempt?.lockedUntil && new Date(attempt.lockedUntil).getTime() > Date.now());
}

function registerFailure(email, ip) {
  const db = readDatabase();
  const key = keyFor(email, ip);
  const now = new Date();
  const existing = db.loginAttempts.find((item) => item.key === key);

  if (!existing || Date.now() - new Date(existing.firstAttemptAt).getTime() > WINDOW_MS) {
    db.loginAttempts = db.loginAttempts.filter((item) => item.key !== key);
    db.loginAttempts.push({
      key,
      email: String(email || "").toLowerCase(),
      ip,
      count: 1,
      firstAttemptAt: now.toISOString(),
      lockedUntil: null
    });
  } else {
    existing.count += 1;
    if (existing.count >= MAX_ATTEMPTS) {
      existing.lockedUntil = new Date(Date.now() + LOCK_MS).toISOString();
    }
  }

  writeDatabase(db);
}

function clearFailures(email, ip) {
  const db = readDatabase();
  const key = keyFor(email, ip);
  db.loginAttempts = db.loginAttempts.filter((item) => item.key !== key);
  writeDatabase(db);
}

module.exports = { clearFailures, isBlocked, registerFailure };
