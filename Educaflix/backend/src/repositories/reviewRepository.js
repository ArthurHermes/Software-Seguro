const { readDatabase, writeDatabase } = require("../database/jsonDatabase");

function listReviewsByVideo(videoId) {
  const db = readDatabase();
  return db.reviews
    .filter((review) => review.videoId === videoId)
    .map((review) => {
      const user = db.users.find((item) => item.id === review.userId);
      return { ...review, autor: user?.nome || "Usuario" };
    });
}

function findReviewById(id) {
  return readDatabase().reviews.find((review) => review.id === id) || null;
}

function findReviewByUserAndVideo(userId, videoId) {
  return readDatabase().reviews.find((review) => review.userId === userId && review.videoId === videoId) || null;
}

function createReview(review) {
  const db = readDatabase();
  db.reviews.push(review);
  writeDatabase(db);
  return review;
}

function updateReview(id, updates) {
  const db = readDatabase();
  const review = db.reviews.find((item) => item.id === id);
  if (!review) return null;

  Object.assign(review, updates, { atualizadoEm: new Date().toISOString() });
  writeDatabase(db);
  return review;
}

function deleteReview(id) {
  const db = readDatabase();
  const exists = db.reviews.some((review) => review.id === id);
  if (!exists) return false;
  db.reviews = db.reviews.filter((review) => review.id !== id);
  writeDatabase(db);
  return true;
}

module.exports = {
  createReview,
  deleteReview,
  findReviewById,
  findReviewByUserAndVideo,
  listReviewsByVideo,
  updateReview
};
