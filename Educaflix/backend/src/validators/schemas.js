const { sanitizeText, sanitizeSearch } = require("../services/sanitizer");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^https?:\/\/[^\s]+$/i;
const NIVEIS = ["basico", "intermediario", "avancado"];
const STATUS_VIDEO = ["ativo", "inativo", "indisponivel"];
const STATUS_USUARIO = ["ativo", "bloqueado"];
const DURACOES = ["curta", "media", "longa"];

function validateCadastro(payload) {
  const result = validateObject(payload, {
    nome: stringField("nome", { min: 3, max: 80 }),
    email: stringField("email", { max: 120, pattern: EMAIL_RE, normalize: (value) => value.toLowerCase() }),
    senha: stringField("senha", { min: 8, max: 72, sanitize: false }),
    confirmar_senha: stringField("confirmar_senha", { min: 8, max: 72, sanitize: false })
  });

  if (!result.ok) return result;

  if (!/[A-Z]/.test(result.data.senha) || !/[a-z]/.test(result.data.senha) || !/[0-9]/.test(result.data.senha)) {
    return invalid("senha", "Senha deve conter letras maiusculas, minusculas e numeros.");
  }

  if (result.data.senha !== result.data.confirmar_senha) {
    return invalid("confirmar_senha", "As senhas nao coincidem.");
  }

  return valid({
    nome: result.data.nome,
    email: result.data.email,
    senha: result.data.senha
  });
}

function validateLogin(payload) {
  const result = validateObject(payload, {
    email: stringField("email", { max: 120, pattern: EMAIL_RE, normalize: (value) => value.toLowerCase() }),
    senha: stringField("senha", { min: 1, max: 72, sanitize: false })
  });

  if (!result.ok) return result;
  return valid(result.data);
}

function validateVideo(payload) {
  return validateObject(payload, {
    titulo: stringField("titulo", { min: 3, max: 120 }),
    descricao: stringField("descricao", { min: 10, max: 600 }),
    categoria: stringField("categoria", { min: 2, max: 60 }),
    tema: stringField("tema", { min: 2, max: 80 }),
    nivel: stringField("nivel", { allowed: NIVEIS }),
    duracaoMinutos: numberField("duracaoMinutos", { integer: true, min: 1, max: 600 }),
    link: stringField("link", { max: 300, pattern: URL_RE }),
    status: stringField("status", { allowed: STATUS_VIDEO })
  });
}

function validateReview(payload) {
  return validateObject(payload, {
    nota: numberField("nota", { integer: true, min: 1, max: 5 }),
    comentario: stringField("comentario", { min: 1, max: 500 })
  });
}

function validateUserStatus(payload) {
  return validateObject(payload, {
    status: stringField("status", { allowed: STATUS_USUARIO })
  });
}

function validateVideoQuery(query) {
  return validateObject(query, {
    busca: stringField("busca", { max: 80, optional: true, sanitizer: sanitizeSearch }),
    categoria: stringField("categoria", { max: 60, optional: true }),
    nivel: stringField("nivel", { allowed: NIVEIS, optional: true }),
    duracao: stringField("duracao", { allowed: DURACOES, optional: true })
  });
}

function validateObject(payload, fields) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return invalid("_body", "Corpo da requisicao deve ser um objeto JSON.");
  }

  const data = {};
  const errors = [];

  for (const [name, validator] of Object.entries(fields)) {
    const result = validator(payload[name]);
    if (!result.ok) {
      errors.push({ campo: name, mensagem: result.message });
    } else if (result.hasValue) {
      data[name] = result.value;
    }
  }

  if (errors.length > 0) return invalidMany(errors);
  return valid(data);
}

function stringField(name, options = {}) {
  return (rawValue) => {
    const optional = Boolean(options.optional);
    if (rawValue === undefined || rawValue === null || rawValue === "") {
      if (optional) return fieldValue("");
      return fieldError(`${name} e obrigatorio.`);
    }

    if (typeof rawValue !== "string") return fieldError(`${name} deve ser texto.`);

    const sanitizer = options.sanitizer || sanitizeText;
    const sanitized = options.sanitize === false ? rawValue.trim() : sanitizer(rawValue);
    const value = options.normalize ? options.normalize(sanitized) : sanitized;

    if (!optional && value.length === 0) return fieldError(`${name} e obrigatorio.`);
    if (options.min !== undefined && value.length < options.min) {
      return fieldError(`${name} deve ter pelo menos ${options.min} caracteres.`);
    }
    if (options.max !== undefined && value.length > options.max) {
      return fieldError(`${name} deve ter no maximo ${options.max} caracteres.`);
    }
    if (options.pattern && !options.pattern.test(value)) return fieldError(`${name} tem formato invalido.`);
    if (options.allowed && !options.allowed.includes(value)) return fieldError(`${name} possui valor nao permitido.`);

    return fieldValue(value);
  };
}

function numberField(name, options = {}) {
  return (value) => {
    if (typeof value !== "number" || !Number.isFinite(value)) return fieldError(`${name} deve ser numero.`);
    if (options.integer && !Number.isInteger(value)) return fieldError(`${name} deve ser inteiro.`);
    if (options.min !== undefined && value < options.min) return fieldError(`${name} deve ser maior ou igual a ${options.min}.`);
    if (options.max !== undefined && value > options.max) return fieldError(`${name} deve ser menor ou igual a ${options.max}.`);

    return fieldValue(value);
  };
}

function fieldValue(value) {
  return { ok: true, hasValue: true, value };
}

function fieldError(message) {
  return { ok: false, message };
}

function valid(data) {
  return { ok: true, data, errors: [] };
}

function invalid(campo, mensagem) {
  return invalidMany([{ campo, mensagem }]);
}

function invalidMany(errors) {
  return {
    ok: false,
    data: null,
    errors,
    message: errors[0]?.mensagem || "Dados invalidos."
  };
}

module.exports = {
  validateCadastro,
  validateLogin,
  validateReview,
  validateUserStatus,
  validateVideo,
  validateVideoQuery
};
