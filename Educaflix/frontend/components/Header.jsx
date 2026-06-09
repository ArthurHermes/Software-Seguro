"use client";

import Link from "next/link";
import { useSession } from "../hooks/useSession";

export default function Header({ current = "home", user = null, onLogout }) {
  const session = useSession();
  const resolvedUser = user || session.user;
  const resolvedLogout = onLogout || session.logout;

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
          {!resolvedUser ? (
            <Link className={`nav__link ${current === "cadastro" ? "nav__link--active" : ""}`} href="/cadastro">
              Cadastro
            </Link>
          ) : null}
          {!resolvedUser ? (
            <Link className={`nav__link ${current === "login" ? "nav__link--active" : ""}`} href="/login">
              Entrar
            </Link>
          ) : null}
          {resolvedUser ? (
            <Link className={`nav__link ${current === "perfil" ? "nav__link--active" : ""}`} href="/perfil">
              Perfil
            </Link>
          ) : null}
          {resolvedUser?.role === "admin" ? (
            <Link className={`nav__link ${current === "admin" ? "nav__link--active" : ""}`} href="/admin">
              Admin
            </Link>
          ) : null}
          {resolvedUser ? (
            <button className="nav__button" type="button" onClick={resolvedLogout}>
              Sair
            </button>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
