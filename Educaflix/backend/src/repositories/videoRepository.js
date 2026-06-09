const { getDatabase, rowToVideo } = require("../database/sqliteDatabase");

function listVideos(filters = {}) {
  const { busca, categoria, nivel, duracao } = filters;
  const db = getDatabase();
  const conditions = [];
  const params = [];

  if (busca) {
    conditions.push("(LOWER(titulo) LIKE ? OR LOWER(descricao) LIKE ? OR LOWER(tema) LIKE ?)");
    const search = `%${busca.toLowerCase()}%`;
    params.push(search, search, search);
  }

  if (categoria) {
    conditions.push("categoria = ?");
    params.push(categoria);
  }

  if (nivel) {
    conditions.push("nivel = ?");
    params.push(nivel);
  }

  if (duracao === "curta") conditions.push("duracao_minutos <= 20");
  if (duracao === "media") conditions.push("duracao_minutos > 20 AND duracao_minutos <= 45");
  if (duracao === "longa") conditions.push("duracao_minutos > 45");

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const rows = db
    .prepare(`
      SELECT
        videos.*,
        ROUND(AVG(reviews.nota), 1) AS media_avaliacoes,
        COUNT(reviews.id) AS total_avaliacoes
      FROM videos
      LEFT JOIN reviews ON reviews.video_id = videos.id
      ${where}
      GROUP BY videos.id
      ORDER BY videos.criado_em ASC
    `)
    .all(...params);

  return rows.map(rowToVideoWithRating);
}

function findVideoById(id) {
  const db = getDatabase();
  const row = db
    .prepare(`
      SELECT
        videos.*,
        ROUND(AVG(reviews.nota), 1) AS media_avaliacoes,
        COUNT(reviews.id) AS total_avaliacoes
      FROM videos
      LEFT JOIN reviews ON reviews.video_id = videos.id
      WHERE videos.id = ?
      GROUP BY videos.id
      LIMIT 1
    `)
    .get(id);

  return row ? rowToVideoWithRating(row) : null;
}

function createVideo(video) {
  const db = getDatabase();
  db.prepare(`
    INSERT INTO videos (
      id, titulo, descricao, categoria, tema, nivel, duracao_minutos, link, status, criado_em, atualizado_em
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    video.id,
    video.titulo,
    video.descricao,
    video.categoria,
    video.tema,
    video.nivel,
    video.duracaoMinutos,
    video.link,
    video.status,
    video.criadoEm,
    video.atualizadoEm
  );
  return findVideoById(video.id);
}

function updateVideo(id, updates) {
  const db = getDatabase();
  const result = db.prepare(`
    UPDATE videos
    SET titulo = ?, descricao = ?, categoria = ?, tema = ?, nivel = ?, duracao_minutos = ?, link = ?, status = ?, atualizado_em = ?
    WHERE id = ?
  `).run(
    updates.titulo,
    updates.descricao,
    updates.categoria,
    updates.tema,
    updates.nivel,
    updates.duracaoMinutos,
    updates.link,
    updates.status,
    new Date().toISOString(),
    id
  );
  if (result.changes === 0) return null;
  return findVideoById(id);
}

function deleteVideo(id) {
  const db = getDatabase();
  const result = db.prepare("DELETE FROM videos WHERE id = ?").run(id);
  return result.changes > 0;
}

function getOptions() {
  const db = getDatabase();
  const videos = db.prepare("SELECT categoria FROM videos ORDER BY categoria ASC").all();
  return {
    categorias: [...new Set(videos.map((video) => video.categoria))].sort(),
    niveis: ["basico", "intermediario", "avancado"]
  };
}

function rowToVideoWithRating(row) {
  const video = rowToVideo(row);
  return {
    ...video,
    mediaAvaliacoes: row.media_avaliacoes === null ? null : Number(row.media_avaliacoes),
    totalAvaliacoes: Number(row.total_avaliacoes || 0)
  };
}

module.exports = {
  createVideo,
  deleteVideo,
  findVideoById,
  getOptions,
  listVideos,
  updateVideo
};
