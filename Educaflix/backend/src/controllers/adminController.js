const { sendJson } = require("../utils/http");
const { findAllUsers, updateUserStatus } = require("../repositories/userRepository");
const { invalidateUserSessions } = require("../services/sessionService");

function listUsers(req, res) {
  sendJson(res, 200, { usuarios: findAllUsers() });
}

function changeUserStatus(req, res, id) {
  const payload = req.validatedBody;

  if (id === req.user.id && payload.status === "bloqueado") {
    return sendJson(res, 400, { erro: "Administrador nao pode bloquear a propria conta." });
  }

  const user = updateUserStatus(id, payload.status);
  if (!user) return sendJson(res, 404, { erro: "Usuario nao encontrado." });
  if (payload.status === "bloqueado") invalidateUserSessions(id);

  sendJson(res, 200, { mensagem: "Status atualizado.", usuario: user });
}

module.exports = { changeUserStatus, listUsers };
