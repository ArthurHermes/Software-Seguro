# EducaFlix

EducaFlix e uma aplicacao educacional com frontend em Next.js e backend HTTP em Node.js. O sistema permite cadastro, login, listagem de videos educacionais, avaliacoes de usuarios e administracao do catalogo de videos.

## Tecnologias

- Node.js 20
- Backend Node.js com modulo `http` nativo
- Frontend Next.js, React e CSS
- SQLite com arquivo local
- Testes com `node:test`
- GitHub Actions para execucao automatica dos testes

## Estrutura

- `backend/src/routes`: definicao das rotas da API
- `backend/src/controllers`: controllers de autenticacao, videos, avaliacoes e admin
- `backend/src/services`: hash de senha, sessoes, sanitizacao e controle de tentativas de login
- `backend/src/repositories`: acesso a usuarios, videos e avaliacoes
- `backend/src/middlewares`: autenticacao, autorizacao admin, CSRF, validacao e headers de seguranca
- `backend/src/validators`: validacoes de cadastro, login e entidade principal
- `backend/tests`: testes automatizados
- `frontend`: interface web
- `docs`: requisitos de seguranca da RA3

## Configuracao

Copie os exemplos de ambiente e ajuste se necessario:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Nao versionar arquivos `.env`. Eles ja estao cobertos pelo `.gitignore`.

## Instalar dependencias

```bash
npm ci
```

## Rodar o projeto

Backend:

```bash
npm run dev:backend
```

Frontend:

```bash
npm run dev:frontend
```

Por padrao, o backend roda em `http://localhost:3333` e o frontend em `http://localhost:3000`.

## Rodar testes

```bash
npm test
```

Os testes usam banco temporario via `EDUCAFLIX_DB_FILE`, entao nao alteram `backend/data/database.sqlite`.

## Build

```bash
npm run build
```

## Funcionalidades principais

- Cadastro de usuario: `POST /api/cadastro`
- Login: `POST /api/login`
- Usuario autenticado: `GET /api/me`
- Logout: `POST /api/logout`
- Listar videos: `GET /api/videos`
- Detalhar video: `GET /api/videos/:id`
- Criar, atualizar e remover videos: rotas admin protegidas
- Criar, atualizar e remover avaliacoes: rotas autenticadas com controle por `userId`
- Perfil do usuario autenticado: `GET /api/me` no backend e `/perfil` no frontend

Contas demo geradas pelo banco inicial:

- Admin: `admin@educaflix.local` / `Admin@12345`
- Aluno: `aluno@educaflix.local` / `Aluno@12345`

## Seguranca implementada

- Senhas armazenadas com PBKDF2, salt individual e comparacao segura.
- Respostas publicas de usuario removem `senhaHash` e `senhaSalt`.
- Rotas privadas exigem sessao por cookie HTTP-only.
- Operacoes `POST`, `PUT`, `PATCH` e `DELETE` protegidas por token CSRF.
- Rotas administrativas exigem `role: "admin"`.
- Validacao de e-mail, senha forte, campos obrigatorios e campos da entidade `video`.
- Sanitizacao basica de textos e buscas.
- Controle de tentativas de login com bloqueio temporario.
- `.env` ignorado e `.env.example` versionado.
- Persistencia relacional em SQLite com consultas parametrizadas no backend.
- Testes automatizados cobrindo autenticacao, validacao, hash, autorizacao e CRUD de video.

## GitHub Actions

O workflow esta em `.github/workflows/tests.yml`. Ele usa Node.js 20, instala dependencias com `npm ci` e executa `npm test` em push e pull request para `main` e `develop`.

## Requisitos de seguranca RA3

O arquivo-base para PDF esta em `docs/requisitos-seguranca-ra3.md`. Antes da entrega, exporte esse Markdown para PDF pela ferramenta de sua preferencia, por exemplo pelo editor de texto/IDE ou por conversor Markdown ja disponivel no ambiente.
