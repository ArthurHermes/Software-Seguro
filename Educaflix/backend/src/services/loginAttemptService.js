const { getDatabase, rowToLoginAttempt } = require("../database/sqliteDatabase");

const WINDOW_MS = 15 * 60 * 1000;
const LOCK_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const MAX_LOGS = 500;

function normalizeAccount(account) {
  return String(account || "").trim().toLowerCase();
}

function keyFor(scope, identifier) {
  return `${scope}:${String(identifier || "").trim().toLowerCase()}`;
}

function getKeys(email, ip) {
  const account = normalizeAccount(email);
  const keys = [];

  if (ip) keys.push({ scope: "ip", identifier: ip, key: keyFor("ip", ip) });
  if (account) keys.push({ scope: "account", identifier: account, key: keyFor("account", account) });

  return keys;
}

function isExpired(attempt, nowMs = Date.now()) {
  const lockedUntilMs = attempt.lockedUntil ? new Date(attempt.lockedUntil).getTime() : 0;
  if (lockedUntilMs && lockedUntilMs <= nowMs) return true;

  const firstAttemptMs = new Date(attempt.firstAttemptAt).getTime();
  return !lockedUntilMs && nowMs - firstAttemptMs > WINDOW_MS;
}

function cleanupExpiredLoginAttempts() {
  const nowMs = Date.now();
  const db = getDatabase();
  const attempts = db.prepare("SELECT * FROM login_attempts").all().map(rowToLoginAttempt);
  const expiredKeys = attempts.filter((attempt) => isExpired(attempt, nowMs)).map((attempt) => attempt.key);
  if (expiredKeys.length === 0) return;

  const removeExpired = db.prepare("DELETE FROM login_attempts WHERE key = ?");
  const transaction = db.transaction((keys) => {
    for (const key of keys) removeExpired.run(key);
  });
  transaction(expiredKeys);
}

function getBlockedAttempt(email, ip) {
  cleanupExpiredLoginAttempts();

  const db = getDatabase();
  const nowMs = Date.now();
  const findAttempt = db.prepare("SELECT * FROM login_attempts WHERE key = ? LIMIT 1");

  return getKeys(email, ip)
    .map(({ key }) => findAttempt.get(key))
    .filter(Boolean)
    .map(rowToLoginAttempt)
    .find((attempt) => attempt?.lockedUntil && new Date(attempt.lockedUntil).getTime() > nowMs) || null;
}

function isBlocked(email, ip) {
  return Boolean(getBlockedAttempt(email, ip));
}

function upsertFailure(db, target, now) {
  const existingRow = db.prepare("SELECT * FROM login_attempts WHERE key = ? LIMIT 1").get(target.key);
  const existing = existingRow ? rowToLoginAttempt(existingRow) : null;
  const nowMs = now.getTime();

  if (!existing || isExpired(existing, nowMs)) {
    db.prepare("DELETE FROM login_attempts WHERE key = ?").run(target.key);
    db.prepare(`
      INSERT INTO login_attempts (key, scope, identifier, count, first_attempt_at, last_attempt_at, locked_until)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      target.key,
      target.scope,
      target.identifier,
      1,
      now.toISOString(),
      now.toISOString(),
      null
    );
  } else {
    const count = existing.count + 1;
    const lockedUntil = count >= MAX_ATTEMPTS ? new Date(nowMs + LOCK_MS).toISOString() : existing.lockedUntil;
    db.prepare(`
      UPDATE login_attempts
      SET count = ?, last_attempt_at = ?, locked_until = ?
      WHERE key = ?
    `).run(count, now.toISOString(), lockedUntil || null, target.key);
  }
}

function registerFailure(email, ip) {
  cleanupExpiredLoginAttempts();

  const db = getDatabase();
  const now = new Date();
  const keys = getKeys(email, ip);

  keys.forEach((target) => upsertFailure(db, target, now));
}

function clearFailures(email) {
  cleanupExpiredLoginAttempts();

  const account = normalizeAccount(email);
  if (!account) return;

  const db = getDatabase();
  db.prepare("DELETE FROM login_attempts WHERE key = ?").run(keyFor("account", account));
}

function logLoginAttempt({ email, ip, outcome, reason }) {
  const db = getDatabase();
  const log = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    email: normalizeAccount(email) || null,
    ip: ip || "unknown",
    outcome,
    reason,
    occurredAt: new Date().toISOString()
  };

  db.prepare(`
    INSERT INTO login_attempt_logs (id, email, ip, outcome, reason, occurred_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(log.id, log.email, log.ip, log.outcome, log.reason, log.occurredAt);
  db.prepare(`
    DELETE FROM login_attempt_logs
    WHERE id NOT IN (
      SELECT id FROM login_attempt_logs ORDER BY occurred_at DESC LIMIT ?
    )
  `).run(MAX_LOGS);

  console.info("Tentativa de login:", {
    email: log.email || "nao_informado",
    ip: log.ip,
    outcome: log.outcome,
    reason: log.reason
  });
}

function startLoginAttemptCleanup(intervalMs = 60 * 1000) {
  const timer = setInterval(cleanupExpiredLoginAttempts, intervalMs);
  if (typeof timer.unref === "function") timer.unref();
  return timer;
}

module.exports = {
  LOCK_MS,
  MAX_ATTEMPTS,
  WINDOW_MS,
  clearFailures,
  cleanupExpiredLoginAttempts,
  getBlockedAttempt,
  isBlocked,
  logLoginAttempt,
  registerFailure,
  startLoginAttemptCleanup
};
