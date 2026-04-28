"use client";

import { useState } from "react";
import Button from "../../components/Button";
import Header from "../../components/Header";
import Input from "../../components/Input";
import { apiFetch } from "../../lib/api";

export default function LoginPage() {
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
      const data = await apiFetch("/api/login", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      localStorage.setItem("educaflix_csrf", data.csrfToken);
      window.location.href = "/videos";
    } catch (error) {
      setFeedback({ type: "error", message: error.message || "E-mail ou senha invalidos." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Header current="login" />
      <main className="page auth">
        <section className="container">
          <div className="auth__wrap">
            <h1 className="auth__title">Entrar no EducaFlix</h1>
            <p className="auth__subtitle">Use sua conta para avaliar videos e acessar funcoes protegidas.</p>

            <form className="auth__form" onSubmit={handleSubmit}>
              <Input label="E-mail" name="email" id="email" type="email" placeholder="voce@exemplo.com" />
              <Input label="Senha" name="senha" id="senha" type="password" placeholder="Sua senha" />

              {feedback ? (
                <p className={`feedback feedback--${feedback.type}`} aria-live="polite">{feedback.message}</p>
              ) : (
                <p className="feedback" aria-live="polite" />
              )}

              <div className="auth__actions">
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Entrando..." : "Entrar"}</Button>
                <Button href="/cadastro" variant="secondary">Criar conta</Button>
              </div>
            </form>

            <p className="auth__back helper-text">
              Contas demo: admin@educaflix.local / Admin@12345 ou aluno@educaflix.local / Aluno@12345
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
