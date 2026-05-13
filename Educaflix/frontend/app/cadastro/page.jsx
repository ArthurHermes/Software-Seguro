"use client";

import { useState } from "react";
import Button from "../../components/Button";
import Header from "../../components/Header";
import Input from "../../components/Input";
import { apiFetch } from "../../lib/api";

export default function CadastroPage() {
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());

    try {
      const result = await apiFetch("/api/cadastro", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      setFeedback({
        type: "success",
        message: `Cadastro realizado com sucesso para ${result.usuario.nome}.`
      });
      form.reset();
    } catch (error) {
      setFeedback({ type: "error", message: error.message || "Nao foi possivel conectar ao backend." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Header current="cadastro" />

      <main className="page auth">
        <section className="container">
          <div className="auth__wrap">
            <h1 className="auth__title">Criar conta no EducaFlix</h1>
            <p className="auth__subtitle">Preencha os dados abaixo para comecar sua jornada de estudos.</p>

            <form className="auth__form" onSubmit={handleSubmit}>
              <Input label="Nome" name="nome" id="nome" type="text" placeholder="Seu nome completo" />
              <Input label="E-mail" name="email" id="email" type="email" placeholder="voce@exemplo.com" />
              <Input label="Senha" name="senha" id="senha" type="password" placeholder="Minimo 8 caracteres" />
              <Input
                label="Confirmar senha"
                name="confirmar_senha"
                id="confirmar_senha"
                type="password"
                placeholder="Repita sua senha"
              />

              {feedback ? (
                <p className={`feedback feedback--${feedback.type}`} aria-live="polite">
                  {feedback.message}
                </p>
              ) : (
                <p className="feedback" aria-live="polite" />
              )}

              <div className="auth__actions">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Cadastrando..." : "Cadastrar"}
                </Button>
                <Button href="/login" variant="secondary">Ir para login</Button>
              </div>
            </form>

            <p className="auth__back helper-text">
              Ja conhece a plataforma? <a className="link-inline" href="/login">Entrar na conta</a>
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
