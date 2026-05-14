const { getCookies, sendJson } = require("../utils/http");
const { getSession } = require("../services/sessionService");
const { findUserById, publicUser } = require("../repositories/userRepository");

function sendAuthRequired(res) {
  sendJson(res, 401, {
    erro: "Autenticacao obrigatoria.",
    codigo: "AUTH_REQUIRED"
  });
}

function sendAccessDenied(res, code = "ACCESS_DENIED") {
  sendJson(res, 403, {
    erro: "Acesso negado.",
    codigo: code
  });
}

function authenticate(req, res) {
  const cookies = getCookies(req);
  const session = getSession(cookies.educaflix_session);
  if (!session) {
    sendAuthRequired(res);
    return null;
  }

  const user = findUserById(session.userId);
  if (!user || user.status !== "ativo") {
    sendAuthRequired(res);
    return null;
  }

  req.user = publicUser(user);
  req.session = session;
  return req.user;
}

function requireCsrf(req, res) {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) return true;

  const csrfHeader = req.headers["x-csrf-token"];
  if (!req.session || csrfHeader !== req.session.csrfToken) {
    sendAccessDenied(res, "CSRF_INVALID");
    return false;
  }

  return true;
}

module.exports = {
  authenticate,
  requireCsrf,
  sendAccessDenied,
  sendAuthRequired
};
