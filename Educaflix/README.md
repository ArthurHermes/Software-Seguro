# EducaFlix

MVP web educacional em Next.js e Node.js para cadastro, login, busca de videos, avaliacoes e administracao do catalogo.

## Como executar

Pre-requisitos:

- Node.js 20 ou superior
- npm

Instale as dependencias:

```bash
npm install
```

Inicie o backend:

```bash
npm run dev:backend
```

Em outro terminal, inicie o frontend:

```bash
npm run dev:frontend
```

Acesse:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3333/api/health`

Contas iniciais criadas automaticamente em `backend/data/database.json`:

- Administrador: `admin@educaflix.local` / `Admin@12345`
- Usuario comum: `aluno@educaflix.local` / `Aluno@12345`

## Telas implementadas

- T1 Tela inicial: `frontend/app/page.jsx`
- T2 Cadastro de usuario: `frontend/app/cadastro/page.jsx`
- T3 Login: `frontend/app/login/page.jsx`
- T4 Modelo de dominio principal, Video Educacional:
  - Catalogo, busca e filtros: `frontend/app/videos/page.jsx`
  - Detalhes e avaliacoes: `frontend/app/videos/[id]/page.jsx`
  - CRUD administrativo de videos: `frontend/app/admin/page.jsx`

## Arquitetura MVC

- Model: regras e dados de dominio em `backend/src/repositories`, `backend/src/services` e validadores em `backend/src/validators`.
- View: telas React/Next em `frontend/app` e componentes em `frontend/components`.
- Controller: fluxo HTTP em `backend/src/controllers`.
- DAO/Repository: persistencia JSON em `backend/src/repositories/*Repository.js` usando `backend/src/database/jsonDatabase.js`.
- Router: despacho de rotas em `backend/src/routes/index.js`.

## Design Patterns aplicados

- MVC: separa controllers, views e model/repositories.
- Repository/DAO: `userRepository`, `videoRepository` e `reviewRepository` isolam a persistencia.
- Singleton de acesso a dados: `jsonDatabase.js` centraliza leitura/escrita do arquivo de dados.
- Strategy: validadores separados em `validators/schemas.js` aplicam regras especificas por caso de uso.
- Facade: `apiFetch` no frontend centraliza chamadas HTTP, credenciais e tratamento de erro.

## Requisitos de seguranca implementados

- A1 HTTPS/cookies seguros: cookies `HttpOnly`, `SameSite=Lax`, cabecalhos de seguranca e suporte a `Secure` quando a aplicacao estiver atras de HTTPS.
- A2 RBAC admin: `requireAdmin` bloqueia rotas administrativas com HTTP 403.
- A3 Hash de senha com salt: `passwordService.js` usa PBKDF2 com salt por usuario; senha nunca e salva em texto puro.
- B1 Validacao backend: `validators/schemas.js` valida tipo, tamanho, formato e valores permitidos antes dos controllers alterarem dados.
- B2 Acesso seguro a dados: persistencia passa por repositories/DAO, sem concatenacao de entrada do usuario em consultas.
- B3 Saida segura: React renderiza comentarios como texto, sem `dangerouslySetInnerHTML`; backend sanitiza campos textuais.
- C1 Bloqueio de tentativas: `loginAttemptService.js` bloqueia por e-mail/IP apos 5 falhas em 15 minutos.
- C2 CSRF: rotas autenticadas que alteram dados exigem header `X-CSRF-Token`.
- C3 Encerramento de sessao: logout invalida sessao; bloqueio de usuario invalida sessoes ativas.
- C4 Erros genericos: respostas sensiveis nao expoem stack trace, caminhos internos ou detalhes de implementacao.

## Rotas principais da API

- `POST /api/cadastro`
- `POST /api/login`
- `GET /api/me`
- `POST /api/logout`
- `GET /api/videos`
- `GET /api/videos/:id`
- `POST /api/videos/:id/avaliacoes`
- `PUT /api/avaliacoes/:id`
- `DELETE /api/avaliacoes/:id`
- `POST /api/videos` admin
- `PUT /api/videos/:id` admin
- `DELETE /api/videos/:id` admin
- `GET /api/admin/usuarios` admin
- `PATCH /api/admin/usuarios/:id/status` admin

## Validacao realizada

```bash
npm run build
```

Tambem foram testados manualmente via API: health check, login admin, sessao, CRUD de video, cadastro, login de usuario comum, publicacao de avaliacao e bloqueio 403 para acesso administrativo sem permissao.
