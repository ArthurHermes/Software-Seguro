const crypto = require("crypto");
const { sendJson, setCookie, clearCookie, getCookies, getClientIp } = require("../utils/http");
const { hashPassword, verifyPassword } = require("../services/passwordService");
const { createSession, invalidateSession } = require("../services/sessionService");
const { clearFailures, logLoginAttempt, registerFailure } = require("../services/loginAttemptService");
const { GENERIC_LOGIN_ERROR, enforceLoginRateLimit } = require("../middlewares/loginRateLimitMiddleware");
const { createUser, findUserByEmail, publicUser } = require("../repositories/userRepository");

function cadastro(req, res) {
  const payload = req.validatedBody;

  const existing = findUserByEmail(payload.email);
  if (existing) return sendJson(res, 409, { erro: "Este e-mail ja esta cadastrado." });

  const password = hashPassword(payload.senha);
  const user = createUser({
    id: crypto.randomUUID(),
    nome: payload.nome,
    email: payload.email,
    senhaHash: password.hash,
    senhaSalt: password.salt,
    role: "usuario",
    status: "ativo",
    criadoEm: new Date().toISOString()
  });

  sendJson(res, 201, { mensagem: "Cadastro realizado com sucesso.", usuario: user });
}

function login(req, res) {
  const payload = req.validatedBody;
  const ip = getClientIp(req);
  const email = payload.email;

  if (!enforceLoginRateLimit(req, res, email, ip)) return;

  const user = findUserByEmail(payload.email);
  const canLogin =
    user &&
    user.status === "ativo" &&
    verifyPassword(payload.senha, user.senhaSalt, user.senhaHash);

  if (!canLogin) {
    registerFailure(payload.email, ip);
    logLoginAttempt({ email: payload.email, ip, outcome: "failure", reason: "invalid_credentials" });
    return sendJson(res, 401, { erro: GENERIC_LOGIN_ERROR });
  }

  clearFailures(payload.email);
  logLoginAttempt({ email: payload.email, ip, outcome: "success", reason: "authenticated" });
  const session = createSession(user.id);
  setCookie(res, "educaflix_session", session.token, {
    maxAge: 60 * 60 * 2,
    secure: req.headers["x-forwarded-proto"] === "https"
  });

  sendJson(res, 200, {
    mensagem: "Login realizado com sucesso.",
    usuario: publicUser(user),
    csrfToken: session.csrfToken,
    expiresAt: session.expiresAt
  });
}

function me(req, res) {
  sendJson(res, 200, {
    usuario: req.user,
    csrfToken: req.session.csrfToken
  });
}

function logout(req, res) {
  const cookies = getCookies(req);
  invalidateSession(cookies.educaflix_session);
  clearCookie(res, "educaflix_session");
  sendJson(res, 200, { mensagem: "Sessao encerrada." });
}

module.exports = { cadastro, login, logout, me };
