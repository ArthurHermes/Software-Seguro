const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { after, before, describe, test } = require("node:test");

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "educaflix-test-"));
process.env.EDUCAFLIX_DB_FILE = path.join(tempDir, "database.sqlite");
process.env.ALLOWED_ORIGIN = "http://localhost:3000";

const { createServer } = require("../src/app");
const { closeDatabase, initializeDatabase, readDatabase } = require("../src/database/sqliteDatabase");
const { hashPassword, verifyPassword } = require("../src/services/passwordService");

let server;
let baseUrl;

before(async () => {
  initializeDatabase();
  server = createServer();
  await new Promise((resolve) => server.listen(0, resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  closeDatabase();
  fs.rmSync(tempDir, { recursive: true, force: true });
});

async function request(pathname, options = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  return {
    status: response.status,
    body,
    setCookie: response.headers.get("set-cookie")
  };
}

async function login(email, senha) {
  const response = await request("/api/login", {
    method: "POST",
    body: { email, senha }
  });

  assert.equal(response.status, 200);
  return {
    cookie: response.setCookie.split(";")[0],
    csrfToken: response.body.csrfToken,
    usuario: response.body.usuario
  };
}

describe("seguranca de autenticacao", () => {
  test("cadastro nao aceita e-mail invalido", async () => {
    const response = await request("/api/cadastro", {
      method: "POST",
      body: {
        nome: "Aluno Teste",
        email: "email-invalido",
        senha: "Senha123",
        confirmar_senha: "Senha123"
      }
    });

    assert.equal(response.status, 400);
    assert.match(response.body.detalhes[0].mensagem, /formato invalido/);
  });

  test("cadastro nao aceita senha fraca", async () => {
    const response = await request("/api/cadastro", {
      method: "POST",
      body: {
        nome: "Aluno Teste",
        email: "fraco@educaflix.local",
        senha: "senhafraca",
        confirmar_senha: "senhafraca"
      }
    });

    assert.equal(response.status, 400);
    assert.match(response.body.detalhes[0].mensagem, /maiusculas, minusculas e numeros/);
  });

  test("senha cadastrada e salva como hash e nao aparece na resposta", async () => {
    const response = await request("/api/cadastro", {
      method: "POST",
      body: {
        nome: "Aluno Seguro",
        email: "seguro@educaflix.local",
        senha: "Senha123",
        confirmar_senha: "Senha123"
      }
    });

    assert.equal(response.status, 201);
    assert.equal(response.body.usuario.senha, undefined);
    assert.equal(response.body.usuario.senhaHash, undefined);
    assert.equal(response.body.usuario.senhaSalt, undefined);

    const saved = readDatabase().users.find((user) => user.email === "seguro@educaflix.local");
    assert.ok(saved);
    assert.notEqual(saved.senhaHash, "Senha123");
    assert.ok(verifyPassword("Senha123", saved.senhaSalt, saved.senhaHash));
  });

  test("servico de senha gera hash verificavel e diferente da senha original", () => {
    const password = "Senha123";
    const hashed = hashPassword(password);

    assert.notEqual(hashed.hash, password);
    assert.ok(verifyPassword(password, hashed.salt, hashed.hash));
    assert.equal(verifyPassword("SenhaErrada123", hashed.salt, hashed.hash), false);
  });

  test("login falha com senha incorreta e funciona com credenciais corretas", async () => {
    const wrongPassword = await request("/api/login", {
      method: "POST",
      body: { email: "seguro@educaflix.local", senha: "SenhaErrada123" }
    });
    assert.equal(wrongPassword.status, 401);

    const authenticated = await request("/api/login", {
      method: "POST",
      body: { email: "seguro@educaflix.local", senha: "Senha123" }
    });
    assert.equal(authenticated.status, 200);
    assert.equal(authenticated.body.usuario.email, "seguro@educaflix.local");
    assert.ok(authenticated.body.csrfToken);
    assert.match(authenticated.setCookie, /HttpOnly/);
    assert.match(authenticated.setCookie, /SameSite=Lax/);
  });

  test("rota protegida bloqueia usuario nao autenticado", async () => {
    const response = await request("/api/me");

    assert.equal(response.status, 401);
    assert.equal(response.body.codigo, "AUTH_REQUIRED");
  });
});

describe("seguranca da entidade principal video", () => {
  test("video nao aceita dados invalidos", async () => {
    const admin = await login("admin@educaflix.local", "Admin@12345");
    const response = await request("/api/videos", {
      method: "POST",
      headers: {
        Cookie: admin.cookie,
        "X-CSRF-Token": admin.csrfToken
      },
      body: {
        titulo: "JS",
        descricao: "curta",
        categoria: "Programacao",
        tema: "JS",
        nivel: "basico",
        duracaoMinutos: 0,
        link: "url-invalida",
        status: "ativo"
      }
    });

    assert.equal(response.status, 400);
  });

  test("usuario comum nao pode criar video administrativo", async () => {
    const aluno = await login("seguro@educaflix.local", "Senha123");
    const response = await request("/api/videos", {
      method: "POST",
      headers: {
        Cookie: aluno.cookie,
        "X-CSRF-Token": aluno.csrfToken
      },
      body: validVideoPayload()
    });

    assert.equal(response.status, 403);
  });

  test("operacao mutavel autenticada exige token csrf", async () => {
    const admin = await login("admin@educaflix.local", "Admin@12345");
    const response = await request("/api/videos", {
      method: "POST",
      headers: {
        Cookie: admin.cookie
      },
      body: validVideoPayload()
    });

    assert.equal(response.status, 403);
    assert.equal(response.body.codigo, "CSRF_INVALID");
  });

  test("admin lista usuarios sem expor hash ou salt de senha", async () => {
    const admin = await login("admin@educaflix.local", "Admin@12345");
    const response = await request("/api/admin/usuarios", {
      headers: {
        Cookie: admin.cookie
      }
    });

    assert.equal(response.status, 200);
    assert.ok(response.body.usuarios.length > 0);
    for (const usuario of response.body.usuarios) {
      assert.equal(usuario.senhaHash, undefined);
      assert.equal(usuario.senhaSalt, undefined);
    }
  });

  test("admin consegue criar, buscar, atualizar e remover video", async () => {
    const admin = await login("admin@educaflix.local", "Admin@12345");
    const create = await request("/api/videos", {
      method: "POST",
      headers: {
        Cookie: admin.cookie,
        "X-CSRF-Token": admin.csrfToken
      },
      body: validVideoPayload()
    });

    assert.equal(create.status, 201);
    const videoId = create.body.video.id;

    const detail = await request(`/api/videos/${videoId}`);
    assert.equal(detail.status, 200);
    assert.equal(detail.body.video.titulo, "Node Seguro na Pratica");

    const update = await request(`/api/videos/${videoId}`, {
      method: "PUT",
      headers: {
        Cookie: admin.cookie,
        "X-CSRF-Token": admin.csrfToken
      },
      body: { ...validVideoPayload(), titulo: "Node Seguro Atualizado" }
    });
    assert.equal(update.status, 200);
    assert.equal(update.body.video.titulo, "Node Seguro Atualizado");

    const remove = await request(`/api/videos/${videoId}`, {
      method: "DELETE",
      headers: {
        Cookie: admin.cookie,
        "X-CSRF-Token": admin.csrfToken
      }
    });
    assert.equal(remove.status, 200);
  });

  test("usuario nao pode alterar avaliacao de outro usuario", async () => {
    const autor = await login("seguro@educaflix.local", "Senha123");
    const createReview = await request("/api/videos/video-html-semantico/avaliacoes", {
      method: "POST",
      headers: {
        Cookie: autor.cookie,
        "X-CSRF-Token": autor.csrfToken
      },
      body: {
        nota: 5,
        comentario: "Conteudo claro e util para iniciantes."
      }
    });

    assert.equal(createReview.status, 201);

    const outroUsuario = await login("aluno@educaflix.local", "Aluno@12345");
    const updateReview = await request(`/api/avaliacoes/${createReview.body.avaliacao.id}`, {
      method: "PUT",
      headers: {
        Cookie: outroUsuario.cookie,
        "X-CSRF-Token": outroUsuario.csrfToken
      },
      body: {
        nota: 1,
        comentario: "Tentativa de edicao por outro usuario."
      }
    });

    assert.equal(updateReview.status, 403);
  });
});

function validVideoPayload() {
  return {
    titulo: "Node Seguro na Pratica",
    descricao: "Aula sobre validacao, autenticacao e persistencia segura em Node.",
    categoria: "Ciberseguranca",
    tema: "Node.js",
    nivel: "intermediario",
    duracaoMinutos: 35,
    link: "https://www.youtube.com/watch?v=2_lswM1S264",
    status: "ativo"
  };
}
