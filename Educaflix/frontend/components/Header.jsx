import Link from "next/link";

export default function Header({ current = "home" }) {
  return (
    <header className="app-header">
      <div className="container app-header__inner">
        <Link className="logo" href="/" aria-label="Ir para a pagina inicial">
          <span className="logo__badge" aria-hidden="true">Play</span>
          <span>EducaFlix</span>
        </Link>

        <nav className="nav" aria-label="Navegacao principal">
          <Link className={`nav__link ${current === "home" ? "nav__link--active" : ""}`} href="/">
            Inicio
          </Link>
          <Link className={`nav__link ${current === "cadastro" ? "nav__link--active" : ""}`} href="/cadastro">
            Cadastro
          </Link>
        </nav>
      </div>
    </header>
  );
}
