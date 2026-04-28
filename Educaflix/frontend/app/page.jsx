import Button from "../components/Button";
import Header from "../components/Header";

export default function HomePage() {
  const year = new Date().getFullYear();

  return (
    <>
      <Header current="home" />

      <main className="page" id="topo">
        <section className="hero">
          <div className="container hero__wrap">
            <div>
              <p className="hero__kicker">Plataforma de aprendizado em video</p>
              <h1 className="hero__title">
                Aprenda no seu ritmo com uma experiencia de estudo clara e moderna.
              </h1>
              <p className="hero__subtitle">
                O EducaFlix organiza conteudos por trilhas para facilitar sua evolucao.
                Comece hoje e construa uma rotina de estudo pratica com videos curtos e objetivos.
              </p>

              <div className="hero__actions">
                <Button href="/login">Entrar</Button>
                <Button href="/cadastro" variant="secondary">Cadastrar</Button>
                <Button href="/videos" variant="secondary">Ver catalogo</Button>
              </div>
            </div>

            <aside className="hero__panel" aria-label="Indicadores da plataforma">
              <div className="hero__stats">
                <article className="stat">
                  <p className="stat__value">Catalogo curado</p>
                  <p className="stat__label">Videos com categoria, nivel, duracao e status de acesso.</p>
                </article>
                <article className="stat">
                  <p className="stat__value">Avaliacoes</p>
                  <p className="stat__label">Usuarios autenticados publicam notas e comentarios nos conteudos.</p>
                </article>
                <article className="stat">
                  <p className="stat__value">Admin seguro</p>
                  <p className="stat__label">Funcoes administrativas exigem permissao e protecao CSRF.</p>
                </article>
              </div>
            </aside>
          </div>
        </section>

        <section className="features" id="beneficios">
          <div className="container">
            <h2 className="section-title">Por que escolher o EducaFlix?</h2>
            <p className="section-subtitle">
              Um ambiente pensado para foco, consistencia visual e progressao clara do seu aprendizado.
            </p>

            <div className="card-grid">
              <article className="card">
                <div className="card__icon" aria-hidden="true">1</div>
                <h3 className="card__title">Conteudo organizado</h3>
                <p className="card__description">Busca por palavra-chave e filtros por categoria, nivel e duracao.</p>
              </article>

              <article className="card">
                <div className="card__icon" aria-hidden="true">2</div>
                <h3 className="card__title">Evolucao acelerada</h3>
                <p className="card__description">Cadastro, login, sessao, logout e bloqueio de tentativas invalidas.</p>
              </article>

              <article className="card">
                <div className="card__icon" aria-hidden="true">3</div>
                <h3 className="card__title">Experiencia confiavel</h3>
                <p className="card__description">CRUD de videos e gerenciamento de usuarios no painel administrativo.</p>
              </article>
            </div>
          </div>
        </section>
      </main>

      <footer className="container helper-text">
        <p>EducaFlix - {year}</p>
      </footer>
    </>
  );
}
