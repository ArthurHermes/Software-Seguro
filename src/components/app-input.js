class AppInput extends HTMLElement {
  connectedCallback() {
    const label = this.getAttribute("label") || "Campo";
    const type = this.getAttribute("type") || "text";
    const name = this.getAttribute("name") || "campo";
    const id = this.getAttribute("id") || name;
    const placeholder = this.getAttribute("placeholder") || "";

    this.innerHTML = `
      <div class="input-group">
        <label class="input-group__label" for="${id}">${label}</label>
        <input class="input" id="${id}" name="${name}" type="${type}" placeholder="${placeholder}" />
      </div>
    `;
  }
}

customElements.define("app-input", AppInput);
