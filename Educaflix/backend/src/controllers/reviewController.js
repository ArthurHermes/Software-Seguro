const crypto = require("crypto");
const { sendJson } = require("../utils/http");
const { findVideoById } = require("../repositories/videoRepository");
const {
  createReview,
  deleteReview,
  findReviewById,
  findReviewByUserAndVideo,
  updateReview
} = require("../repositories/reviewRepository");

function create(req, res, videoId) {
  if (!findVideoById(videoId)) return sendJson(res, 404, { erro: "Video nao encontrado." });

  const existing = findReviewByUserAndVideo(req.user.id, videoId);
  if (existing) return sendJson(res, 409, { erro: "Voce ja avaliou este video." });

  const now = new Date().toISOString();
  const review = createReview({
    id: crypto.randomUUID(),
    videoId,
    userId: req.user.id,
    ...req.validatedBody,
    criadoEm: now,
    atualizadoEm: now
  });

  sendJson(res, 201, { mensagem: "Avaliacao publicada.", avaliacao: review });
}

function update(req, res, id) {
  const review = findReviewById(id);
  if (!review) return sendJson(res, 404, { erro: "Avaliacao nao encontrada." });
  if (review.userId !== req.user.id) return sendJson(res, 403, { erro: "Permissao insuficiente." });

  sendJson(res, 200, {
    mensagem: "Avaliacao atualizada.",
    avaliacao: updateReview(id, req.validatedBody)
  });
}

function remove(req, res, id) {
  const review = findReviewById(id);
  if (!review) return sendJson(res, 404, { erro: "Avaliacao nao encontrada." });
  if (review.userId !== req.user.id) return sendJson(res, 403, { erro: "Permissao insuficiente." });

  deleteReview(id);
  sendJson(res, 200, { mensagem: "Avaliacao removida." });
}

module.exports = { create, remove, update };
