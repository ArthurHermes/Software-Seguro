class AppButton extends HTMLElement {
  connectedCallback() {
    const variant = this.getAttribute("variant") || "primary";
    const href = this.getAttribute("href");
    const type = this.getAttribute("type") || "button";
    const label = this.getAttribute("label") || this.textContent.trim() || "Ação";

    if (href) {
      this.innerHTML = `<a class="button button--${variant}" href="${href}">${label}</a>`;
      return;
    }

    this.innerHTML = `<button class="button button--${variant}" type="${type}">${label}</button>`;
  }
}

customElements.define("app-button", AppButton);
