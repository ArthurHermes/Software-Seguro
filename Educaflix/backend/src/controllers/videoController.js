const crypto = require("crypto");
const { sendJson } = require("../utils/http");
const {
  createVideo,
  deleteVideo,
  findVideoById,
  getOptions,
  listVideos,
  updateVideo
} = require("../repositories/videoRepository");
const { listReviewsByVideo } = require("../repositories/reviewRepository");

function list(req, res) {
  const filters = req.validatedQuery;
  sendJson(res, 200, { videos: listVideos(filters), filtros: filters });
}

function options(req, res) {
  sendJson(res, 200, getOptions());
}

function detail(req, res, id) {
  const video = findVideoById(id);
  if (!video) return sendJson(res, 404, { erro: "Video nao encontrado." });
  sendJson(res, 200, { video, avaliacoes: listReviewsByVideo(id) });
}

function create(req, res) {
  const now = new Date().toISOString();
  const video = createVideo({
    id: crypto.randomUUID(),
    ...req.validatedBody,
    criadoEm: now,
    atualizadoEm: now
  });

  sendJson(res, 201, { mensagem: "Video cadastrado.", video });
}

function update(req, res, id) {
  const video = updateVideo(id, req.validatedBody);
  if (!video) return sendJson(res, 404, { erro: "Video nao encontrado." });

  sendJson(res, 200, { mensagem: "Video atualizado.", video });
}

function remove(req, res, id) {
  const removed = deleteVideo(id);
  if (!removed) return sendJson(res, 404, { erro: "Video nao encontrado." });
  sendJson(res, 200, { mensagem: "Video removido." });
}

module.exports = { create, detail, list, options, remove, update };
