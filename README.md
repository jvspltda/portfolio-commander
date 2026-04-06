# 💼 Portfolio Commander

Sistema completo de gerenciamento de portfólio de investimentos com atualização automática de preços, alertas e relatórios.

**Modelo de uso:** instância para **um único usuário**. O login é **somente com esse e-mail**, **sem senha** (quem souber o endereço e tiver o usuário criado no banco obtém JWT). E-mail padrão: **`jvsp.ltda2@gmail.com`** (`ALLOWED_USER_EMAIL` no backend). Não há cadastro público. **Não use em produção aberta na internet** sem camada extra (VPN, IP allowlist, etc.).

## 🎯 Features

### ✅ Gerenciamento de Ativos
- Adicionar/remover/editar ativos
- Suporte para: Ações BR/USA, ETFs, Cripto, Renda Fixa, Commodities
- Multi-moeda (BRL/USD)
- Cálculo automático de P&L

### ✅ Atualização Automática de Preços
- **Ações / ETFs BR**: [Brapi](https://brapi.dev)
- **Ações / ETFs EUA**: [Alpha Vantage](https://www.alphavantage.co/) (`ALPHA_VANTAGE_KEY`)
- **Cripto**: [CoinGecko](https://www.coingecko.com/) (mapeamento por ticker)
- **Cron diário**: 18:00 (horário `America/Sao_Paulo`), depois verificação de alertas
- **Histórico**: registros em `PriceHistory` (ex.: últimos 30 no detalhe do ativo)
- **Manual**: botão no dashboard atualiza só os ativos do usuário logado

### ✅ Sistema de Alertas
- Preço, ganho/perda % e **alocação** (% do ativo sobre o patrimônio total)
- Condições: `>`, `<`, `>=`, `<=`
- Notificações in-app; **e-mail opcional** (Nodemailer + variáveis `SMTP_*` / `MAIL_FROM`)
- Ação sugerida customizável; alerta desativa após disparar

### ✅ Relatórios e Análises
- Resumo do portfólio (Carteira A + B)
- Top performers / Worst performers
- Alocação por tipo de ativo
- Progresso até meta (R$ 6.7M)
- Export CSV/JSON

## 🏗️ Arquitetura
```
┌─────────────────┐
│  React Frontend │  ← Vercel (GRÁTIS)
│   (Vite + TW)  │
└────────┬────────┘
         │ HTTPS
         ↓
┌─────────────────┐
│  Node.js API    │  ← Railway (GRÁTIS)
│ (Express + JWT) │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   PostgreSQL    │  ← Supabase (GRÁTIS)
│   (Prisma ORM)  │
└─────────────────┘
         ↑
         │ Cron (TZ America/Sao_Paulo)
         │ 18h: atualiza preços
         │ a cada 15 min: alertas
```

## 📦 Estrutura do Projeto
```
portfolio-commander/
├── backend/              # Node.js API
│   ├── src/
│   │   ├── routes/      # Endpoints REST
│   │   ├── services/    # Lógica de negócio
│   │   ├── middleware/  # Auth JWT
│   │   └── utils/       # Helpers
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   └── seed.js        # Dados iniciais
│   └── package.json
│
├── frontend/             # React SPA
│   ├── src/
│   │   ├── components/  # Componentes React
│   │   ├── services/    # API calls
│   │   └── utils/       # Helpers
│   └── package.json
│
└── docs/
    ├── SETUP.md         # Tutorial instalação
    ├── DEPLOY.md        # Tutorial deploy
    └── API.md           # Docs API
```

## 🚀 Quick Start

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Conta Supabase (grátis)

### 1. Clone o repositório
```bash
git clone <seu-repo>
cd portfolio-commander
```

### 2. Configure Backend
```bash
cd backend
npm install
cp .env.example .env
# Edite .env com suas credenciais
npx prisma migrate dev
npm run seed
npm run dev
```

### 3. Configure Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Edite .env com URL do backend
npm run dev
```

### 4. Acesse
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Login: botão **Entrar** (sem senha). É necessário existir o usuário no banco — rode `npm run seed` na pasta `backend` na primeira vez. E-mail fixo: **jvsp.ltda2@gmail.com** (ou o valor de `ALLOWED_USER_EMAIL`).

### Produção (referência)

| O quê | URL |
|--------|-----|
| **Site (Vercel)** | [https://portfolio-commander.vercel.app](https://portfolio-commander.vercel.app) |
| **Backend (Railway)** | [https://portfolio-commander-production.up.railway.app](https://portfolio-commander-production.up.railway.app) |
| **Health check** | `https://portfolio-commander-production.up.railway.app/health` |
| **API REST (base)** | `https://portfolio-commander-production.up.railway.app/api` |

**Vercel — `VITE_API_URL`:** use exatamente  
`https://portfolio-commander-production.up.railway.app/api`  
Salve e faça **Redeploy** do frontend.

**Railway — variáveis:** `FRONTEND_URL` deve ser exatamente `https://portfolio-commander.vercel.app` (origem permitida no CORS). Sem isso, o navegador bloqueia chamadas à API a partir do site.

**“Erro no servidor” ao entrar:** quase sempre **banco** ou **usuário inexistente**. Confira no Railway: **`DATABASE_URL`** (URI **Direct** do Supabase), **`JWT_SECRET`**. Na subida do container roda `prisma migrate deploy` (`npm start` → `scripts/start-prod.js`); falta criar o usuário no banco de produção uma vez (`npm run seed` com `.env` apontando para o banco certo).

**Supabase — `FATAL: Tenant or user not found`:** costuma ser **connection string do pooler** com usuário errado. Use **Direct connection** no painel (host `db.<ref>.supabase.co`, porta **5432**) só em **`DATABASE_URL`**. Senha com caracteres especiais: use a URI já codificada do Supabase. Depois, **Redeploy** no Railway.

**“Prisma não conseguiu inicializar”:** em geral **`DATABASE_URL` ausente ou inválida** no Railway (ou variável com nome errado). Remova `DIRECT_URL` se ainda existir no painel — o schema usa só `DATABASE_URL`.

Se a página ainda pedir **senha**, o frontend na Vercel está em build antigo: envie o código atual ao Git e dispare um novo deploy.

## 📚 Documentação Completa

- [📘 Setup Local](docs/SETUP.md) - Como rodar no seu computador
- [📗 Deploy](docs/DEPLOY.md) - Como colocar online
- [📕 API](docs/API.md) - Documentação dos endpoints

## 💰 Custo

**R$ 0,00/mês** para até 1-5 usuários

| Serviço | Plano | Limite | Custo |
|---------|-------|--------|-------|
| Vercel | Hobby | 100GB bandwidth | Grátis |
| Railway | Starter | 500h/mês | Grátis |
| Supabase | Free | 500MB DB | Grátis |

## 🔐 Segurança

- Login **sem senha** para o único e-mail permitido (adequado a uso pessoal / rede confiável)
- O campo `password` no banco pode permanecer do seed (não é usado no login atual)
- Autenticação JWT (expira em 7 dias); em **produção** é obrigatório definir `JWT_SECRET`
- HTTPS recomendado em deploy
- CORS configurado (`FRONTEND_URL`)
- SQL injection mitigado (Prisma ORM)

## 📊 Tecnologias

**Frontend:**
- React 18.2
- Vite 5.0
- Tailwind CSS 3.4
- Axios 1.6
- React Router 6.20

**Backend:**
- Node.js 20
- Express 4.18
- Prisma 5.7
- PostgreSQL 15
- bcrypt 5.1
- jsonwebtoken 9.0
- node-cron 3.0
- nodemailer (e-mail de alertas, opcional)

## 🧩 Variáveis de ambiente (resumo)

| Variável | Onde | Descrição |
|----------|------|-----------|
| `DATABASE_URL` | backend | PostgreSQL |
| `JWT_SECRET` | backend | Obrigatório em produção |
| `ALLOWED_USER_EMAIL` | backend | Único e-mail de login (padrão: jvsp.ltda2@gmail.com) |
| `FRONTEND_URL` | backend | Origem CORS |
| `VITE_API_URL` | frontend | URL da API (ex. `http://localhost:3000/api`) |
| `USD_BRL` | backend | Taxa USD→BRL (padrão 5.43) |
| `VITE_USD_BRL` | frontend | Mesma taxa para exibição/cálculos locais (opcional) |
| `SMTP_*`, `MAIL_FROM` | backend | Envio de e-mail nos alertas (opcional) |
| `ALPHA_VANTAGE_KEY` | backend | Cotações EUA (opcional) |

## 👤 Autor

**João Victor**
- Email: jvsp.ltda2@gmail.com
- WhatsApp: +55 38 99824-0504
- GitHub: @jvspltda

## 📄 Licença

MIT License - use livremente!

## 🙏 Créditos

Desenvolvido com ❤️ por Claude AI (Anthropic)

---

**Versão:** 1.0.0  
**Última atualização:** abril de 2026