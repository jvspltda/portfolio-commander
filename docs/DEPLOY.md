# Deploy — Portfolio Commander

Visão geral: **Vercel** (frontend) + **Railway** (backend Node) + **Supabase** (PostgreSQL).

---

## 1. Supabase (banco)

1. Crie o projeto em [supabase.com](https://supabase.com).
2. **Project Settings → Database** → copie a connection string **Direct** (host `db.<ref>.supabase.co`, porta `5432`, usuário `postgres`).
3. Guarde **senha** do banco; na URI, caracteres especiais na senha devem estar **URL-encoded**.

---

## 2. Railway — backend (detalhado)

### 2.1 Criar o serviço

1. Acesse [railway.app](https://railway.app) e faça login com **GitHub**.
2. **New Project** → **Deploy from GitHub repo** → selecione `portfolio-commander` (ou o nome do seu fork).
3. O Railway detecta **Nixpacks** (há `backend/nixpacks.toml` na pasta `backend`).

### 2.2 Ajustar raiz do serviço (importante)

O código da API está em **`backend/`**:

1. Clique no **serviço** (card do deploy).
2. **Settings** → **Root Directory** → defina: **`backend`**
3. Salve. O próximo deploy usará `backend/nixpacks.toml` e `backend/package.json`.

Se a raiz for a raiz do monorepo sem apontar para `backend`, o build pode falhar ou subir o projeto errado.

### 2.3 Variáveis de ambiente (Variables)

No serviço → **Variables** → adicione (valores reais vêm do Supabase / gerados por você):

| Variável | Obrigatório | Descrição |
|----------|-------------|-----------|
| `DATABASE_URL` | Sim | URI **PostgreSQL** do Supabase. Recomendação: **Direct connection** (evita erro *Tenant or user not found* no pooler). Acrescente `?sslmode=require` se o painel não incluir. |
| `DIRECT_URL` | Sim | **Mesma URI** da conexão direta ao Postgres (Prisma usa para migrations). Se usar só direct, duplique o valor de `DATABASE_URL`. |
| `JWT_SECRET` | Sim | String longa e aleatória (não commite no Git). |
| `ALLOWED_USER_EMAIL` | Opcional | E-mail único permitido no login (padrão no código: `jvsp.ltda2@gmail.com`). |
| `FRONTEND_URL` | Sim | URL exata do site na Vercel, ex.: `https://portfolio-commander.vercel.app` (CORS). Sem `barra` no final. |
| `NODE_ENV` | Sim | `production` |
| `PORT` | Opcional | O Railway injeta `PORT`; pode omitir ou usar `3000`. |
| `TZ` | Opcional | `America/Sao_Paulo` (crons de preço/alertas). |

Salve. O Railway costuma **redeployar** sozinho ao alterar variáveis.

### 2.4 Domínio público

1. Serviço → **Settings** → **Networking** / **Domains**.
2. **Generate Domain** (ou domínio customizado).
3. Anote a URL, ex.: `https://portfolio-commander-production.up.railway.app`  
   A API REST fica em: **`https://<seu-dominio>/api`**

### 2.5 O que o deploy executa (Nixpacks)

- **Install (build):** `npm install --omit=dev` → `prisma generate` → **`prisma migrate deploy`**
- **Start:** apenas `node src/server.js`

As migrations rodam no **build** para o container não ficar bloqueado no boot (evita **SIGTERM** / timeout do Railway enquanto espera migrate + servidor). É preciso que **`DATABASE_URL`** e **`DIRECT_URL`** existam já na etapa de build (no Railway costumam estar disponíveis).

Se o build falhar em `migrate deploy`, rode as migrations uma vez no **Shell** do Railway: `cd backend && npx prisma migrate deploy`, ou corrija as variáveis.

### 2.6 Verificar se subiu

No navegador ou `curl`:

- `GET https://<seu-dominio>/health` → JSON `status: ok`
- `GET https://<seu-dominio>/health/db` → `database: connected` (se `DATABASE_URL` estiver correta)
- `GET https://<seu-dominio>/api` → lista de rotas

Se `/health/db` falhar, revise `DATABASE_URL` / `DIRECT_URL` e SSL.

### 2.7 Popular o banco (seed) — uma vez

O login precisa do **usuário** no Postgres (criado pelo seed):

- **Opção A — máquina local:** no `backend/.env`, `DATABASE_URL` e `DIRECT_URL` iguais à produção (cuidado para não commitar).  
  `cd backend` → `npm install` → `npx prisma db seed`
- **Opção B — Railway:** **Deployments** → abrir o deploy ativo → **Shell** (se disponível) → entrar na pasta `backend` e `npm run seed` (depende da imagem).

### 2.8 Deploy automático via Git

Com o repositório conectado, cada **push** na branch configurada (ex.: `main`) dispara **novo build/deploy**.  
Alterar só variáveis no Railway **não desliga** isso; após salvar env, muitas vezes há redeploy automático.

---

## 3. Vercel — frontend

1. Importe o mesmo repositório em [vercel.com](https://vercel.com).
2. **Root Directory:** `frontend` (se o monorepo tiver front e back juntos).
3. **Environment Variables:**
   - `VITE_API_URL` = `https://<seu-dominio-railway>/api` (com **`/api` no final**).
4. **Deploy**. Anote a URL (ex.: `https://portfolio-commander.vercel.app`).

### CORS

Volte ao Railway e confirme `FRONTEND_URL` = URL exata do Vercel. Redeploy se necessário.

---

## 4. Próximos passos (checklist)

| # | Ação |
|---|------|
| 1 | Supabase com projeto criado e senha guardada |
| 2 | Railway: serviço com **Root Directory** = `backend` |
| 3 | Railway: `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `FRONTEND_URL`, `NODE_ENV=production` |
| 4 | Railway: domínio gerado; testar `/health` e `/health/db` |
| 5 | Rodar **seed** no banco de produção |
| 6 | Vercel: `VITE_API_URL` apontando para `.../api` |
| 7 | Testar site → **Entrar** (e-mail permitido) |
| 8 | Próximos deploys: `git push` no `main` (e variáveis sempre só no painel, nunca no repositório) |

---

## 5. Problemas comuns

| Sintoma | O que checar |
|---------|----------------|
| **`npm error signal SIGTERM`** / processo morto ao subir | O Railway encerrou o processo (timeout, OOM ou health check). Migrações foram movidas para o **build** do Nixpacks para o start só rodar `node`. Confira **Logs** do deploy; se faltar RAM, tente variável `NODE_OPTIONS=--max-old-space-size=512`. |
| *Tenant or user not found* | Usar URI **Direct** do Supabase; mesma URI em `DATABASE_URL` e `DIRECT_URL`. |
| 500 no login | Logs do Railway; `/health/db`; seed executado; `JWT_SECRET` definido. |
| CORS no navegador | `FRONTEND_URL` = URL exata do Vercel. |
| Build falha em `migrate deploy` | `DATABASE_URL`/`DIRECT_URL` no Railway; se o build não vê variáveis, rode `migrate deploy` uma vez no Shell do serviço. |
| Build falha | Root Directory `backend`; `nixpacks.toml` na pasta `backend`. |

---

## 6. Atualizar código depois

```bash
git add .
git commit -m "sua mensagem"
git push origin main
```

Railway (e Vercel, se ligado ao Git) redeployam conforme a integração.

---

## 7. Custos (planos gratuitos típicos)

Uso pessoal costuma caber nos limites gratuitos; confira os sites oficiais de Vercel, Railway e Supabase para limites atuais.
