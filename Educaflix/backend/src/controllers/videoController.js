const crypto = require("crypto");
const { parseUrl, readJsonBody, sendJson } = require("../utils/http");
const { validateVideo, validateVideoQuery } = require("../validators/schemas");
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
  const { query } = parseUrl(req);
  const filters = validateVideoQuery(query);
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

async function create(req, res) {
  const payload = await readJsonBody(req);
  const validation = validateVideo(payload);
  if (!validation.ok) return sendJson(res, 400, { erro: validation.message });

  const now = new Date().toISOString();
  const video = createVideo({
    id: crypto.randomUUID(),
    ...validation.data,
    criadoEm: now,
    atualizadoEm: now
  });

  sendJson(res, 201, { mensagem: "Video cadastrado.", video });
}

async function update(req, res, id) {
  const payload = await readJsonBody(req);
  const validation = validateVideo(payload);
  if (!validation.ok) return sendJson(res, 400, { erro: validation.message });

  const video = updateVideo(id, validation.data);
  if (!video) return sendJson(res, 404, { erro: "Video nao encontrado." });

  sendJson(res, 200, { mensagem: "Video atualizado.", video });
}

function remove(req, res, id) {
  const removed = deleteVideo(id);
  if (!removed) return sendJson(res, 404, { erro: "Video nao encontrado." });
  sendJson(res, 200, { mensagem: "Video removido." });
}

module.exports = { create, detail, list, options, remove, update };
