const crypto = require("crypto");
const { readJsonBody, sendJson, setCookie, clearCookie, getCookies, getClientIp } = require("../utils/http");
const { validateCadastro, validateLogin } = require("../validators/schemas");
const { hashPassword, verifyPassword } = require("../services/passwordService");
const { createSession, invalidateSession } = require("../services/sessionService");
const { clearFailures, logLoginAttempt, registerFailure } = require("../services/loginAttemptService");
const { GENERIC_LOGIN_ERROR, enforceLoginRateLimit } = require("../middlewares/loginRateLimitMiddleware");
const { createUser, findUserByEmail, publicUser } = require("../repositories/userRepository");

async function cadastro(req, res) {
  const payload = await readJsonBody(req);
  const validation = validateCadastro(payload);
  if (!validation.ok) return sendJson(res, 400, { erro: validation.message });

  const existing = findUserByEmail(validation.data.email);
  if (existing) return sendJson(res, 409, { erro: "Este e-mail ja esta cadastrado." });

  const password = hashPassword(validation.data.senha);
  const user = createUser({
    id: crypto.randomUUID(),
    nome: validation.data.nome,
    email: validation.data.email,
    senhaHash: password.hash,
    senhaSalt: password.salt,
    role: "usuario",
    status: "ativo",
    criadoEm: new Date().toISOString()
  });

  sendJson(res, 201, { mensagem: "Cadastro realizado com sucesso.", usuario: user });
}

async function login(req, res) {
  const payload = await readJsonBody(req);
  const validation = validateLogin(payload);
  const ip = getClientIp(req);
  const email = validation.ok ? validation.data.email : payload?.email;

  if (!enforceLoginRateLimit(req, res, email, ip)) return;

  if (!validation.ok) {
    registerFailure(email, ip);
    logLoginAttempt({ email, ip, outcome: "failure", reason: "invalid_payload" });
    return sendJson(res, 401, { erro: GENERIC_LOGIN_ERROR });
  }

  const user = findUserByEmail(validation.data.email);
  const canLogin =
    user &&
    user.status === "ativo" &&
    verifyPassword(validation.data.senha, user.senhaSalt, user.senhaHash);

  if (!canLogin) {
    registerFailure(validation.data.email, ip);
    logLoginAttempt({ email: validation.data.email, ip, outcome: "failure", reason: "invalid_credentials" });
    return sendJson(res, 401, { erro: GENERIC_LOGIN_ERROR });
  }

  clearFailures(validation.data.email);
  logLoginAttempt({ email: validation.data.email, ip, outcome: "success", reason: "authenticated" });
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
