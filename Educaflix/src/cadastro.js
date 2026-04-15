import "./components/app-header.js";
import "./components/app-button.js";
import "./components/app-input.js";

const form = document.querySelector("#cadastro-form");
const feedback = document.querySelector("#form-feedback");

function showFeedback(message, type) {
  if (!feedback) {
    return;
  }

  feedback.textContent = message;
  feedback.className = `feedback feedback--${type}`;
}

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const payload = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch("/api/cadastro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        showFeedback(result.erro || "Erro ao cadastrar.", "error");
        return;
      }

      showFeedback(`Cadastro realizado com sucesso para ${result.usuario.nome}.`, "success");
      form.reset();
    } catch (error) {
      showFeedback("Não foi possível conectar ao backend.", "error");
    }
  });
}
