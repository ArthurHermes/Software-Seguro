class AppHeader extends HTMLElement {
  connectedCallback() {
    const current = this.getAttribute("current") || "home";
    this.innerHTML = `
      <header class="app-header">
        <div class="container app-header__inner">
          <a class="logo" href="./index.html" aria-label="Ir para a página inicial">
            <span class="logo__badge" aria-hidden="true">
              <svg class="bi" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M10.804 8 5 11.886V4.114z"/>
              </svg>
            </span>
            <span>EducaFlix</span>
          </a>

          <nav class="nav" aria-label="Navegação principal">
            <a class="nav__link ${current === "home" ? "nav__link--active" : ""}" href="./index.html">Início</a>
            <a class="nav__link ${current === "cadastro" ? "nav__link--active" : ""}" href="./cadastro.html">Cadastro</a>
          </nav>
        </div>
      </header>
    `;
  }
}

customElements.define("app-header", AppHeader);
