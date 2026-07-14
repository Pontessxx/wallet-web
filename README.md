# Wallet Web

Frontend React + TypeScript + Vite do projeto Wallet API.

## Requisitos

- Node.js 22+
- npm 10+

## Instalacao

```bash
npm install
```

## Comandos

- `npm run dev`: sobe frontend em modo mock (MSW ativo)
- `npm run dev:msw`: mesmo comportamento do `dev` (MSW ativo)
- `npm run dev:api`: sobe frontend usando API real (MSW desativado)
- `npm run build`: gera build de producao
- `npm run preview`: sobe preview do build
- `npm run lint`: executa lint

## Modos de execucao local

### 1) Rodar com MSW (sem backend)

```bash
npm run dev
```

Nesse modo, os handlers de mock sao usados para testar fluxos da UI.

### 2) Rodar com API real (sem CORS no browser)

1. Suba o backend em `http://localhost:8080`.
2. Rode:

```bash
npm run dev:api
```

O frontend usa `VITE_API_URL=/api` e o Vite faz proxy para `VITE_DEV_BACKEND_URL` (padrao: `http://localhost:8080`).

## Variaveis de ambiente do frontend

Arquivos principais:

- `.env`
- `.env.example`
- `.env.mock`

Valores esperados:

```dotenv
VITE_API_URL=/api
VITE_DEV_BACKEND_URL=http://localhost:8080
VITE_ENABLE_MSW=false
```

No modo `mock`, o arquivo `.env.mock` ativa:

```dotenv
VITE_ENABLE_MSW=true
```

## Docker Compose

No compose da raiz do repositorio, o frontend ja esta configurado para evitar CORS:

- `FRONTEND_VITE_API_URL=/api`
- `FRONTEND_VITE_ENABLE_MSW=false`

Rodar stack completa:

```bash
docker compose up --build
```

Frontend: `http://localhost:3000`

### Ativar MSW no frontend via compose (opcional)

PowerShell:

```powershell
$env:FRONTEND_VITE_ENABLE_MSW = "true"
docker compose up --build
```

Depois, para voltar ao comportamento normal:

```powershell
$env:FRONTEND_VITE_ENABLE_MSW = "false"
```
