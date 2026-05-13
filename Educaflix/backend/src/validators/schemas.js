const { sanitizeText, sanitizeSearch } = require("../services/sanitizer");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^https?:\/\/.+/i;
const NIVEIS = ["basico", "intermediario", "avancado"];
const STATUS_VIDEO = ["ativo", "inativo", "indisponivel"];
const STATUS_USUARIO = ["ativo", "bloqueado"];

function validateCadastro(payload) {
  const nome = sanitizeText(payload.nome);
  const email = sanitizeText(payload.email).toLowerCase();
  const senha = String(payload.senha || "");
  const confirmarSenha = String(payload.confirmar_senha || "");

  if (nome.length < 3 || nome.length > 80) return invalid("Nome deve ter entre 3 e 80 caracteres.");
  if (!EMAIL_RE.test(email) || email.length > 120) return invalid("E-mail invalido.");
  if (senha.length < 8 || senha.length > 72) return invalid("Senha deve ter entre 8 e 72 caracteres.");
  if (!/[A-Z]/.test(senha) || !/[a-z]/.test(senha) || !/[0-9]/.test(senha)) {
    return invalid("Senha deve conter letras maiusculas, minusculas e numeros.");
  }
  if (senha !== confirmarSenha) return invalid("As senhas nao coincidem.");

  return valid({ nome, email, senha });
}

function validateLogin(payload) {
  const email = sanitizeText(payload.email).toLowerCase();
  const senha = String(payload.senha || "");

  if (!EMAIL_RE.test(email) || senha.length < 1 || senha.length > 72) {
    return invalid("Credenciais invalidas.");
  }

  return valid({ email, senha });
}

function validateVideo(payload) {
  const video = {
    titulo: sanitizeText(payload.titulo),
    descricao: sanitizeText(payload.descricao),
    categoria: sanitizeText(payload.categoria),
    tema: sanitizeText(payload.tema),
    nivel: sanitizeText(payload.nivel),
    duracaoMinutos: Number(payload.duracaoMinutos),
    link: sanitizeText(payload.link),
    status: sanitizeText(payload.status || "ativo")
  };

  if (video.titulo.length < 3 || video.titulo.length > 120) return invalid("Titulo invalido.");
  if (video.descricao.length < 10 || video.descricao.length > 600) return invalid("Descricao invalida.");
  if (video.categoria.length < 2 || video.categoria.length > 60) return invalid("Categoria invalida.");
  if (video.tema.length < 2 || video.tema.length > 80) return invalid("Tema invalido.");
  if (!NIVEIS.includes(video.nivel)) return invalid("Nivel invalido.");
  if (!Number.isInteger(video.duracaoMinutos) || video.duracaoMinutos < 1 || video.duracaoMinutos > 600) {
    return invalid("Duracao invalida.");
  }
  if (!URL_RE.test(video.link) || video.link.length > 300) return invalid("Link invalido.");
  if (!STATUS_VIDEO.includes(video.status)) return invalid("Status invalido.");

  return valid(video);
}

function validateReview(payload) {
  const nota = Number(payload.nota);
  const comentario = sanitizeText(payload.comentario);

  if (!Number.isInteger(nota) || nota < 1 || nota > 5) return invalid("Nota deve estar entre 1 e 5.");
  if (comentario.length < 1 || comentario.length > 500) return invalid("Comentario invalido.");

  return valid({ nota, comentario });
}

function validateUserStatus(payload) {
  const status = sanitizeText(payload.status);
  if (!STATUS_USUARIO.includes(status)) return invalid("Status invalido.");
  return valid({ status });
}

function validateVideoQuery(query) {
  return {
    busca: sanitizeSearch(query.busca),
    categoria: sanitizeText(query.categoria),
    nivel: NIVEIS.includes(query.nivel) ? query.nivel : "",
    duracao: ["curta", "media", "longa"].includes(query.duracao) ? query.duracao : ""
  };
}

function valid(data) {
  return { ok: true, data };
}

function invalid(message) {
  return { ok: false, message };
}

module.exports = {
  validateCadastro,
  validateLogin,
  validateReview,
  validateUserStatus,
  validateVideo,
  validateVideoQuery
};
