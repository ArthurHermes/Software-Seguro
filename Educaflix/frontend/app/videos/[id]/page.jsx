"use client";

import { use, useEffect, useState } from "react";
import Button from "../../../components/Button";
import Header from "../../../components/Header";
import { apiFetch } from "../../../lib/api";
import { useSession } from "../../../hooks/useSession";

export default function VideoDetailPage({ params }) {
  const { id: videoId } = use(params);
  const { user, csrfToken, logout } = useSession();
  const [video, setVideo] = useState(null);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [feedback, setFeedback] = useState(null);

  async function load() {
    const data = await apiFetch(`/api/videos/${videoId}`);
    setVideo(data.video);
    setAvaliacoes(data.avaliacoes);
  }

  useEffect(() => {
    load().catch((error) => setFeedback({ type: "error", message: error.message }));
  }, [videoId]);

  async function submitReview(event) {
    event.preventDefault();
    setFeedback(null);
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());

    try {
      await apiFetch(`/api/videos/${videoId}/avaliacoes`, {
        method: "POST",
        csrfToken,
        body: JSON.stringify({ ...payload, nota: Number(payload.nota) })
      });
      event.currentTarget.reset();
      setFeedback({ type: "success", message: "Avaliacao publicada." });
      load();
    } catch (error) {
      setFeedback({ type: "error", message: error.message });
    }
  }

  async function removeReview(id) {
    await apiFetch(`/api/avaliacoes/${id}`, { method: "DELETE", csrfToken });
    load();
  }

  if (!video) {
    return (
      <>
        <Header current="videos" user={user} onLogout={logout} />
        <main className="page"><section className="container"><p className="helper-text">Carregando video...</p></section></main>
      </>
    );
  }

  return (
    <>
      <Header current="videos" user={user} onLogout={logout} />
      <main className="page">
        <section className="container section-stack">
          <div className="detail-layout">
            <article className="detail-main">
              <p className="video-card__meta">{video.categoria} - {video.tema} - {video.nivel}</p>
              <h1 className="section-title">{video.titulo}</h1>
              <p className="section-subtitle">{video.descricao}</p>
              <dl className="facts">
                <div><dt>Duracao</dt><dd>{video.duracaoMinutos} min</dd></div>
                <div><dt>Status</dt><dd>{video.status}</dd></div>
                <div><dt>Media</dt><dd>{video.mediaAvaliacoes ? `${video.mediaAvaliacoes}/5` : "Sem avaliacoes"}</dd></div>
              </dl>
              <a className="button button--primary" href={video.link} target="_blank" rel="noreferrer">Acessar conteudo</a>
            </article>

            <aside className="detail-side">
              <h2 className="compact-title">Publicar avaliacao</h2>
              {user ? (
                <form className="stack-form" onSubmit={submitReview}>
                  <label className="input-group__label" htmlFor="nota">Nota</label>
                  <select className="input" id="nota" name="nota" required>
                    <option value="5">5 - Excelente</option>
                    <option value="4">4 - Bom</option>
                    <option value="3">3 - Regular</option>
                    <option value="2">2 - Fraco</option>
                    <option value="1">1 - Ruim</option>
                  </select>
                  <label className="input-group__label" htmlFor="comentario">Comentario</label>
                  <textarea className="input textarea" id="comentario" name="comentario" maxLength="500" required />
                  <Button type="submit">Enviar avaliacao</Button>
                </form>
              ) : (
                <Button href="/login">Entrar para avaliar</Button>
              )}
            </aside>
          </div>

          {feedback ? <p className={`feedback feedback--${feedback.type}`}>{feedback.message}</p> : null}

          <section>
            <h2 className="compact-title">Avaliacoes</h2>
            <div className="review-list">
              {avaliacoes.map((review) => (
                <article className="review" key={review.id}>
                  <div>
                    <strong>{review.autor}</strong>
                    <p>{review.nota}/5 - {review.comentario}</p>
                  </div>
                  {user?.id === review.userId ? (
                    <Button variant="secondary" onClick={() => removeReview(review.id)}>Remover</Button>
                  ) : null}
                </article>
              ))}
              {avaliacoes.length === 0 ? <p className="helper-text">Nenhuma avaliacao publicada.</p> : null}
            </div>
          </section>
        </section>
      </main>
    </>
  );
}
