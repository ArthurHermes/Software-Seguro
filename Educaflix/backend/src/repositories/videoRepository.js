const { readDatabase, writeDatabase } = require("../database/jsonDatabase");

function listVideos(filters = {}) {
  const { busca, categoria, nivel, duracao } = filters;
  const db = readDatabase();
  let videos = [...db.videos];

  if (busca) {
    const normalized = busca.toLowerCase();
    videos = videos.filter((video) =>
      [video.titulo, video.descricao, video.tema].some((field) =>
        String(field || "").toLowerCase().includes(normalized)
      )
    );
  }

  if (categoria) {
    videos = videos.filter((video) => video.categoria === categoria);
  }

  if (nivel) {
    videos = videos.filter((video) => video.nivel === nivel);
  }

  if (duracao === "curta") videos = videos.filter((video) => video.duracaoMinutos <= 20);
  if (duracao === "media") videos = videos.filter((video) => video.duracaoMinutos > 20 && video.duracaoMinutos <= 45);
  if (duracao === "longa") videos = videos.filter((video) => video.duracaoMinutos > 45);

  return videos.map(withAverageRating);
}

function findVideoById(id) {
  const video = readDatabase().videos.find((item) => item.id === id);
  return video ? withAverageRating(video) : null;
}

function createVideo(video) {
  const db = readDatabase();
  db.videos.push(video);
  writeDatabase(db);
  return withAverageRating(video);
}

function updateVideo(id, updates) {
  const db = readDatabase();
  const index = db.videos.findIndex((video) => video.id === id);
  if (index === -1) return null;

  db.videos[index] = {
    ...db.videos[index],
    ...updates,
    atualizadoEm: new Date().toISOString()
  };
  writeDatabase(db);
  return withAverageRating(db.videos[index]);
}

function deleteVideo(id) {
  const db = readDatabase();
  const exists = db.videos.some((video) => video.id === id);
  if (!exists) return false;

  db.videos = db.videos.filter((video) => video.id !== id);
  db.reviews = db.reviews.filter((review) => review.videoId !== id);
  writeDatabase(db);
  return true;
}

function getOptions() {
  const videos = readDatabase().videos;
  return {
    categorias: [...new Set(videos.map((video) => video.categoria))].sort(),
    niveis: ["basico", "intermediario", "avancado"]
  };
}

function withAverageRating(video) {
  const reviews = readDatabase().reviews.filter((review) => review.videoId === video.id);
  const mediaAvaliacoes = reviews.length
    ? Number((reviews.reduce((sum, review) => sum + review.nota, 0) / reviews.length).toFixed(1))
    : null;

  return { ...video, mediaAvaliacoes, totalAvaliacoes: reviews.length };
}

module.exports = {
  createVideo,
  deleteVideo,
  findVideoById,
  getOptions,
  listVideos,
  updateVideo
};
