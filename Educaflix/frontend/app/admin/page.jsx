"use client";

import { useEffect, useState } from "react";
import Button from "../../components/Button";
import Header from "../../components/Header";
import Input from "../../components/Input";
import { apiFetch } from "../../lib/api";
import { useSession } from "../../hooks/useSession";

const emptyVideo = {
  titulo: "",
  descricao: "",
  categoria: "",
  tema: "",
  nivel: "basico",
  duracaoMinutos: 10,
  link: "",
  status: "ativo"
};

export default function AdminPage() {
  const { user, csrfToken, loading, logout } = useSession();
  const [videos, setVideos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [editing, setEditing] = useState(null);
  const [feedback, setFeedback] = useState(null);

  async function load() {
    const [videosData, usersData] = await Promise.all([
      apiFetch("/api/videos"),
      apiFetch("/api/admin/usuarios")
    ]);
    setVideos(videosData.videos);
    setUsuarios(usersData.usuarios);
  }

  useEffect(() => {
    if (user?.role === "admin") {
      load().catch((error) => setFeedback({ type: "error", message: error.message }));
    }
  }, [user]);

  async function submitVideo(event) {
    event.preventDefault();
    setFeedback(null);
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    payload.duracaoMinutos = Number(payload.duracaoMinutos);

    try {
      await apiFetch(editing ? `/api/videos/${editing.id}` : "/api/videos", {
        method: editing ? "PUT" : "POST",
        csrfToken,
        body: JSON.stringify(payload)
      });
      event.currentTarget.reset();
      setEditing(null);
      setFeedback({ type: "success", message: editing ? "Video atualizado." : "Video cadastrado." });
      load();
    } catch (error) {
      setFeedback({ type: "error", message: error.message });
    }
  }

  async function removeVideo(id) {
    await apiFetch(`/api/videos/${id}`, { method: "DELETE", csrfToken });
    load();
  }

  async function changeStatus(id, status) {
    await apiFetch(`/api/admin/usuarios/${id}/status`, {
      method: "PATCH",
      csrfToken,
      body: JSON.stringify({ status })
    });
    load();
  }

  if (loading) return <main className="page"><section className="container"><p>Carregando...</p></section></main>;
  if (!user || user.role !== "admin") {
    return (
      <>
        <Header current="admin" user={user} onLogout={logout} />
        <main className="page">
          <section className="container section-stack">
            <h1 className="section-title">Painel administrativo</h1>
            <p className="feedback feedback--error">Acesso restrito a administradores.</p>
            <Button href="/login">Entrar como administrador</Button>
          </section>
        </main>
      </>
    );
  }

  const formVideo = editing || emptyVideo;

  return (
    <>
      <Header current="admin" user={user} onLogout={logout} />
      <main className="page">
        <section className="container section-stack">
          <div className="page-heading">
            <div>
              <h1 className="section-title">Painel administrativo</h1>
              <p className="section-subtitle">Cadastro e atualizacao de videos, alem de controle de status de usuarios.</p>
            </div>
          </div>

          {feedback ? <p className={`feedback feedback--${feedback.type}`}>{feedback.message}</p> : null}

          <section className="admin-panel">
            <h2 className="compact-title">{editing ? "Editar video" : "Cadastrar video"}</h2>
            <form className="admin-form" onSubmit={submitVideo} key={editing?.id || "novo-video"}>
              <Input label="Titulo" name="titulo" defaultValue={formVideo.titulo} />
              <Input label="Categoria" name="categoria" defaultValue={formVideo.categoria} />
              <Input label="Tema" name="tema" defaultValue={formVideo.tema} />
              <Input label="Duracao em minutos" name="duracaoMinutos" type="number" min="1" max="600" defaultValue={formVideo.duracaoMinutos} />
              <Input label="Link" name="link" type="url" defaultValue={formVideo.link} />
              <label className="input-group">
                <span className="input-group__label">Nivel</span>
                <select className="input" name="nivel" defaultValue={formVideo.nivel}>
                  <option value="basico">Basico</option>
                  <option value="intermediario">Intermediario</option>
                  <option value="avancado">Avancado</option>
                </select>
              </label>
              <label className="input-group">
                <span className="input-group__label">Status</span>
                <select className="input" name="status" defaultValue={formVideo.status}>
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                  <option value="indisponivel">Indisponivel</option>
                </select>
              </label>
              <label className="input-group input-group--wide">
                <span className="input-group__label">Descricao</span>
                <textarea className="input textarea" name="descricao" defaultValue={formVideo.descricao} required />
              </label>
              <div className="auth__actions">
                <Button type="submit">{editing ? "Salvar alteracoes" : "Cadastrar video"}</Button>
                {editing ? <Button variant="secondary" onClick={() => setEditing(null)}>Cancelar</Button> : null}
              </div>
            </form>
          </section>

          <section>
            <h2 className="compact-title">Videos cadastrados</h2>
            <div className="table-list">
              {videos.map((video) => (
                <article className="table-row" key={video.id}>
                  <div>
                    <strong>{video.titulo}</strong>
                    <p>{video.categoria} • {video.nivel} • {video.status}</p>
                  </div>
                  <div className="row-actions">
                    <Button variant="secondary" onClick={() => setEditing(video)}>Editar</Button>
                    <Button variant="secondary" onClick={() => removeVideo(video.id)}>Remover</Button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section>
            <h2 className="compact-title">Usuarios</h2>
            <div className="table-list">
              {usuarios.map((usuario) => (
                <article className="table-row" key={usuario.id}>
                  <div>
                    <strong>{usuario.nome}</strong>
                    <p>{usuario.email} • {usuario.role} • {usuario.status}</p>
                  </div>
                  {usuario.role !== "admin" ? (
                    <Button
                      variant="secondary"
                      onClick={() => changeStatus(usuario.id, usuario.status === "ativo" ? "bloqueado" : "ativo")}
                    >
                      {usuario.status === "ativo" ? "Bloquear" : "Ativar"}
                    </Button>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        </section>
      </main>
    </>
  );
}
