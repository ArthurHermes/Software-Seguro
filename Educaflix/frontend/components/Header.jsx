import Link from "next/link";

export default function Header({ current = "home", user = null, onLogout }) {
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
          <Link className={`nav__link ${current === "videos" ? "nav__link--active" : ""}`} href="/videos">
            Videos
          </Link>
          <Link className={`nav__link ${current === "cadastro" ? "nav__link--active" : ""}`} href="/cadastro">
            Cadastro
          </Link>
          {!user ? (
            <Link className={`nav__link ${current === "login" ? "nav__link--active" : ""}`} href="/login">
              Entrar
            </Link>
          ) : null}
          {user?.role === "admin" ? (
            <Link className={`nav__link ${current === "admin" ? "nav__link--active" : ""}`} href="/admin">
              Admin
            </Link>
          ) : null}
          {user ? (
            <button className="nav__button" type="button" onClick={onLogout}>
              Sair
            </button>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
