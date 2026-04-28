"use client";

import { useEffect, useState } from "react";
import Button from "../../components/Button";
import Header from "../../components/Header";
import { apiFetch } from "../../lib/api";
import { useSession } from "../../hooks/useSession";

export default function VideosPage() {
  const { user, logout } = useSession();
  const [videos, setVideos] = useState([]);
  const [options, setOptions] = useState({ categorias: [], niveis: [] });
  const [filters, setFilters] = useState({ busca: "", categoria: "", nivel: "", duracao: "" });
  const [feedback, setFeedback] = useState("");

  async function loadVideos(nextFilters = filters) {
    const params = new URLSearchParams(Object.entries(nextFilters).filter(([, value]) => value));
    const data = await apiFetch(`/api/videos?${params.toString()}`);
    setVideos(data.videos);
  }

  useEffect(() => {
    apiFetch("/api/videos/options").then(setOptions).catch(() => setOptions({ categorias: [], niveis: [] }));
    loadVideos().catch((error) => setFeedback(error.message));
  }, []);

  function handleChange(event) {
    const nextFilters = { ...filters, [event.target.name]: event.target.value };
    setFilters(nextFilters);
    loadVideos(nextFilters).catch((error) => setFeedback(error.message));
  }

  return (
    <>
      <Header current="videos" user={user} onLogout={logout} />
      <main className="page">
        <section className="container section-stack">
          <div className="page-heading">
            <div>
              <h1 className="section-title">Catalogo de videos</h1>
              <p className="section-subtitle">Busque conteudos por titulo, descricao ou tema e filtre por classificacao.</p>
            </div>
            {user?.role === "admin" ? <Button href="/admin">Painel admin</Button> : null}
          </div>

          <form className="filter-bar">
            <input className="input" name="busca" placeholder="Buscar por palavra-chave" value={filters.busca} onChange={handleChange} />
            <select className="input" name="categoria" value={filters.categoria} onChange={handleChange}>
              <option value="">Todas categorias</option>
              {options.categorias.map((categoria) => <option key={categoria} value={categoria}>{categoria}</option>)}
            </select>
            <select className="input" name="nivel" value={filters.nivel} onChange={handleChange}>
              <option value="">Todos niveis</option>
              {options.niveis.map((nivel) => <option key={nivel} value={nivel}>{nivel}</option>)}
            </select>
            <select className="input" name="duracao" value={filters.duracao} onChange={handleChange}>
              <option value="">Todas duracoes</option>
              <option value="curta">Ate 20 min</option>
              <option value="media">21 a 45 min</option>
              <option value="longa">Mais de 45 min</option>
            </select>
          </form>

          {feedback ? <p className="feedback feedback--error">{feedback}</p> : null}

          <div className="video-grid">
            {videos.map((video) => (
              <article className="video-card" key={video.id}>
                <div>
                  <p className="video-card__meta">{video.categoria} • {video.nivel} • {video.duracaoMinutos} min</p>
                  <h2 className="video-card__title">{video.titulo}</h2>
                  <p className="video-card__description">{video.descricao}</p>
                </div>
                <div className="video-card__footer">
                  <span>{video.mediaAvaliacoes ? `${video.mediaAvaliacoes}/5` : "Sem avaliacoes"}</span>
                  <Button href={`/videos/${video.id}`} variant="secondary">Detalhes</Button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
