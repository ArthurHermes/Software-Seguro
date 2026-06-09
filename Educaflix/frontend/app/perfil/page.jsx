"use client";

import Button from "../../components/Button";
import Header from "../../components/Header";
import { useSession } from "../../hooks/useSession";

export default function PerfilPage() {
  const { user, loading, logout } = useSession();

  if (loading) {
    return (
      <>
        <Header current="perfil" />
        <main className="page">
          <section className="container section-stack">
            <p>Carregando perfil...</p>
          </section>
        </main>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Header current="perfil" />
        <main className="page">
          <section className="container section-stack">
            <div className="profile-card">
              <h1 className="section-title">Perfil</h1>
              <p className="section-subtitle">
                Voce ainda nao esta autenticado. Faca login para visualizar os dados da sua conta.
              </p>
              <div className="auth__actions">
                <Button href="/login">Entrar</Button>
                <Button href="/cadastro" variant="secondary">Criar conta</Button>
              </div>
            </div>
          </section>
        </main>
      </>
    );
  }

  return (
    <>
      <Header current="perfil" user={user} onLogout={logout} />
      <main className="page">
        <section className="container section-stack">
          <div className="page-heading">
            <div>
              <h1 className="section-title">Meu perfil</h1>
              <p className="section-subtitle">
                Esta tela confirma a sessao ativa e mostra as informacoes publicas da sua conta.
              </p>
            </div>
            <Button href="/videos" variant="secondary">Ir para videos</Button>
          </div>

          <section className="profile-card">
            <div className="profile-card__header">
              <div className="profile-card__badge" aria-hidden="true">
                {user.nome?.slice(0, 1)?.toUpperCase() || "U"}
              </div>
              <div>
                <h2 className="compact-title">{user.nome}</h2>
                <p className="helper-text">Sessao autenticada no EducaFlix</p>
              </div>
            </div>

            <dl className="facts profile-facts">
              <div>
                <dt>Nome</dt>
                <dd>{user.nome}</dd>
              </div>
              <div>
                <dt>E-mail</dt>
                <dd>{user.email}</dd>
              </div>
              <div>
                <dt>Perfil</dt>
                <dd>{user.role}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{user.status}</dd>
              </div>
            </dl>
          </section>
        </section>
      </main>
    </>
  );
}
