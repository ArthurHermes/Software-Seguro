"use client";

import { useState } from "react";
import Button from "../../components/Button";
import Header from "../../components/Header";
import Input from "../../components/Input";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

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
      const response = await fetch(`${API_URL}/api/cadastro`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        setFeedback({ type: "error", message: result.erro || "Erro ao cadastrar." });
        return;
      }

      setFeedback({
        type: "success",
        message: `Cadastro realizado com sucesso para ${result.usuario.nome}.`
      });
      form.reset();
    } catch (error) {
      setFeedback({ type: "error", message: "Nao foi possivel conectar ao backend." });
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
              <Input label="Senha" name="senha" id="senha" type="password" placeholder="Digite sua senha" />
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
                <Button href="/" variant="secondary">Voltar para inicio</Button>
              </div>
            </form>

            <p className="auth__back helper-text">
              Ja conhece a plataforma? <a className="link-inline" href="/">Acessar tela inicial</a>
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
