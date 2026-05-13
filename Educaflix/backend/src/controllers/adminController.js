const { readJsonBody, sendJson } = require("../utils/http");
const { validateUserStatus } = require("../validators/schemas");
const { findAllUsers, updateUserStatus } = require("../repositories/userRepository");
const { invalidateUserSessions } = require("../services/sessionService");

function listUsers(req, res) {
  sendJson(res, 200, { usuarios: findAllUsers() });
}

async function changeUserStatus(req, res, id) {
  const payload = await readJsonBody(req);
  const validation = validateUserStatus(payload);
  if (!validation.ok) return sendJson(res, 400, { erro: validation.message });
  if (id === req.user.id && validation.data.status === "bloqueado") {
    return sendJson(res, 400, { erro: "Administrador nao pode bloquear a propria conta." });
  }

  const user = updateUserStatus(id, validation.data.status);
  if (!user) return sendJson(res, 404, { erro: "Usuario nao encontrado." });
  if (validation.data.status === "bloqueado") invalidateUserSessions(id);

  sendJson(res, 200, { mensagem: "Status atualizado.", usuario: user });
}

module.exports = { changeUserStatus, listUsers };
