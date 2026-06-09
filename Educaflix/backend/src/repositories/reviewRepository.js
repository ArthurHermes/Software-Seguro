const { getDatabase, rowToReview } = require("../database/sqliteDatabase");

function listReviewsByVideo(videoId) {
  const db = getDatabase();
  return db.prepare(`
    SELECT reviews.*, users.nome AS autor
    FROM reviews
    LEFT JOIN users ON users.id = reviews.user_id
    WHERE reviews.video_id = ?
    ORDER BY reviews.criado_em DESC
  `).all(videoId).map((row) => ({ ...rowToReview(row), autor: row.autor || "Usuario" }));
}

function findReviewById(id) {
  const db = getDatabase();
  const row = db.prepare("SELECT * FROM reviews WHERE id = ? LIMIT 1").get(id);
  return row ? rowToReview(row) : null;
}

function findReviewByUserAndVideo(userId, videoId) {
  const db = getDatabase();
  const row = db
    .prepare("SELECT * FROM reviews WHERE user_id = ? AND video_id = ? LIMIT 1")
    .get(userId, videoId);
  return row ? rowToReview(row) : null;
}

function createReview(review) {
  const db = getDatabase();
  db.prepare(`
    INSERT INTO reviews (id, video_id, user_id, nota, comentario, criado_em, atualizado_em)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    review.id,
    review.videoId,
    review.userId,
    review.nota,
    review.comentario,
    review.criadoEm,
    review.atualizadoEm
  );
  return review;
}

function updateReview(id, updates) {
  const db = getDatabase();
  const result = db
    .prepare("UPDATE reviews SET nota = ?, comentario = ?, atualizado_em = ? WHERE id = ?")
    .run(updates.nota, updates.comentario, new Date().toISOString(), id);
  if (result.changes === 0) return null;
  return findReviewById(id);
}

function deleteReview(id) {
  const db = getDatabase();
  const result = db.prepare("DELETE FROM reviews WHERE id = ?").run(id);
  return result.changes > 0;
}

module.exports = {
  createReview,
  deleteReview,
  findReviewById,
  findReviewByUserAndVideo,
  listReviewsByVideo,
  updateReview
};
