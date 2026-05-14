const { readDatabase, writeDatabase } = require("../database/jsonDatabase");

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
  const db = readDatabase();
  if (!Array.isArray(db.loginAttempts)) db.loginAttempts = [];
  const nowMs = Date.now();
  const before = db.loginAttempts.length;

  db.loginAttempts = db.loginAttempts.filter((attempt) => !isExpired(attempt, nowMs));

  if (db.loginAttempts.length !== before) {
    writeDatabase(db);
  }
}

function getBlockedAttempt(email, ip) {
  cleanupExpiredLoginAttempts();

  const db = readDatabase();
  if (!Array.isArray(db.loginAttempts)) db.loginAttempts = [];
  const nowMs = Date.now();

  return getKeys(email, ip)
    .map(({ key }) => db.loginAttempts.find((item) => item.key === key))
    .find((attempt) => attempt?.lockedUntil && new Date(attempt.lockedUntil).getTime() > nowMs) || null;
}

function isBlocked(email, ip) {
  return Boolean(getBlockedAttempt(email, ip));
}

function upsertFailure(db, target, now) {
  const existing = db.loginAttempts.find((item) => item.key === target.key);
  const nowMs = now.getTime();

  if (!existing || isExpired(existing, nowMs)) {
    db.loginAttempts = db.loginAttempts.filter((item) => item.key !== target.key);
    db.loginAttempts.push({
      key: target.key,
      scope: target.scope,
      identifier: target.identifier,
      count: 1,
      firstAttemptAt: now.toISOString(),
      lastAttemptAt: now.toISOString(),
      lockedUntil: null
    });
  } else {
    existing.count += 1;
    existing.lastAttemptAt = now.toISOString();
    if (existing.count >= MAX_ATTEMPTS) {
      existing.lockedUntil = new Date(nowMs + LOCK_MS).toISOString();
    }
  }
}

function registerFailure(email, ip) {
  cleanupExpiredLoginAttempts();

  const db = readDatabase();
  if (!Array.isArray(db.loginAttempts)) db.loginAttempts = [];
  const now = new Date();
  const keys = getKeys(email, ip);

  keys.forEach((target) => upsertFailure(db, target, now));

  writeDatabase(db);
}

function clearFailures(email) {
  cleanupExpiredLoginAttempts();

  const db = readDatabase();
  if (!Array.isArray(db.loginAttempts)) db.loginAttempts = [];
  const account = normalizeAccount(email);
  if (!account) return;

  const keysToClear = new Set([keyFor("account", account)]);

  db.loginAttempts = db.loginAttempts.filter((item) => !keysToClear.has(item.key));
  writeDatabase(db);
}

function logLoginAttempt({ email, ip, outcome, reason }) {
  const db = readDatabase();
  if (!Array.isArray(db.loginAttemptLogs)) db.loginAttemptLogs = [];
  const log = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    email: normalizeAccount(email) || null,
    ip: ip || "unknown",
    outcome,
    reason,
    occurredAt: new Date().toISOString()
  };

  db.loginAttemptLogs.push(log);
  db.loginAttemptLogs = db.loginAttemptLogs.slice(-MAX_LOGS);
  writeDatabase(db);

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
