const { getCookies, sendJson } = require("../utils/http");
const { getSession } = require("../services/sessionService");
const { findUserById, publicUser } = require("../repositories/userRepository");

function authenticate(req, res) {
  const cookies = getCookies(req);
  const session = getSession(cookies.educaflix_session);
  if (!session) {
    sendJson(res, 401, { erro: "Autenticacao obrigatoria." });
    return null;
  }

  const user = findUserById(session.userId);
  if (!user || user.status !== "ativo") {
    sendJson(res, 401, { erro: "Autenticacao obrigatoria." });
    return null;
  }

  req.user = publicUser(user);
  req.session = session;
  return req.user;
}

function requireAdmin(req, res) {
  const user = authenticate(req, res);
  if (!user) return null;

  if (user.role !== "admin") {
    sendJson(res, 403, { erro: "Permissao insuficiente." });
    return null;
  }

  return user;
}

function requireCsrf(req, res) {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) return true;

  const csrfHeader = req.headers["x-csrf-token"];
  if (!req.session || csrfHeader !== req.session.csrfToken) {
    sendJson(res, 403, { erro: "Requisicao nao autorizada." });
    return false;
  }

  return true;
}

module.exports = { authenticate, requireAdmin, requireCsrf };
