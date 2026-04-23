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
                <Button href="/cadastro">Quero me cadastrar</Button>
                <Button href="#beneficios" variant="secondary">Ver beneficios</Button>
              </div>
            </div>

            <aside className="hero__panel" aria-label="Indicadores da plataforma">
              <div className="hero__stats">
                <article className="stat">
                  <p className="stat__value">+320 aulas</p>
                  <p className="stat__label">Conteudo em areas de tecnologia, carreira e negocios.</p>
                </article>
                <article className="stat">
                  <p className="stat__value">Trilhas guiadas</p>
                  <p className="stat__label">Sequencia recomendada para quem quer sair do basico ao avancado.</p>
                </article>
                <article className="stat">
                  <p className="stat__value">Acesso continuo</p>
                  <p className="stat__label">Assista quando quiser e avance com autonomia.</p>
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
                <p className="card__description">
                  Navegacao por categorias e trilhas para reduzir tempo de busca e aumentar tempo de estudo.
                </p>
              </article>

              <article className="card">
                <div className="card__icon" aria-hidden="true">2</div>
                <h3 className="card__title">Evolucao acelerada</h3>
                <p className="card__description">
                  Aulas curtas, objetivas e conectadas para manter progresso constante semana apos semana.
                </p>
              </article>

              <article className="card">
                <div className="card__icon" aria-hidden="true">3</div>
                <h3 className="card__title">Experiencia confiavel</h3>
                <p className="card__description">
                  Interface limpa e pronta para integracao com API e recursos de conta do aluno.
                </p>
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
