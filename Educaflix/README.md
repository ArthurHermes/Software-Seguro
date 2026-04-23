# EducaFlix

Projeto separado em frontend Next.js e backend Node.js.

## Estrutura

- `frontend/`: aplicacao Next.js.
- `backend/`: API Node.js para cadastro de usuarios.
- `backend/data/usuarios.json`: arquivo local usado pela API para persistir cadastros.

## Como rodar

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

Depois acesse `http://localhost:3000`.

## Rotas

- Frontend: `http://localhost:3000`
- Cadastro: `http://localhost:3000/cadastro`
- Backend: `http://localhost:3333/api/cadastro`
- Health check: `http://localhost:3333/api/health`
