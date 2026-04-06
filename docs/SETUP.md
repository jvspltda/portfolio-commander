# 📘 Setup Local - Portfolio Commander

Guia passo-a-passo para rodar o projeto no seu computador.

## ⏱️ Tempo estimado: 20 minutos

---

## 1️⃣ PRÉ-REQUISITOS (5 min)

### Instalar Node.js

**Windows:**
1. Baixe: https://nodejs.org (versão LTS 20.x)
2. Execute o instalador
3. Abra CMD e teste: `node --version`

**Mac:**
```bash
brew install node@20
```

**Linux:**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Instalar Git (se não tiver)

**Windows:** https://git-scm.com/download/win
**Mac:** `brew install git`
**Linux:** `sudo apt install git`

---

## 2️⃣ CRIAR CONTA SUPABASE (3 min)

1. Acesse: https://supabase.com
2. Clique em "Start your project"
3. Login com GitHub
4. Clique em "New project"
5. Preencha:
   - Name: `portfolio-commander`
   - Database Password: (crie uma senha forte)
   - Region: `South America (São Paulo)`
6. Clique em "Create new project"
7. Aguarde 2 minutos (criando database)
8. Vá em **Settings → Database → Connection string → URI**
9. Copie a URL (vai precisar depois)

---

## 3️⃣ CONFIGURAR BACKEND (5 min)
```bash
cd backend

# 1. Instalar dependências
npm install

# 2. Criar arquivo .env
cp .env.example .env

# 3. Editar .env (use notepad, nano, vim ou VSCode)
notepad .env
```

**Cole isso no .env:**
```bash
DATABASE_URL="postgresql://postgres:[SUA_SENHA]@db.[SEU_ID].supabase.co:5432/postgres"
JWT_SECRET="mude-isso-para-algo-super-secreto-123456"
ALLOWED_USER_EMAIL="jvsp.ltda2@gmail.com"
FRONTEND_URL="http://localhost:5173"
TZ="America/Sao_Paulo"
PORT=3000
NODE_ENV="development"
```

**⚠️ IMPORTANTE:** Substitua `[SUA_SENHA]` e `[SEU_ID]` pelos valores do Supabase!
```bash
# 4. Criar tabelas no banco
npx prisma migrate dev --name init

# 5. Popular com seus 26 ativos
npm run seed

# 6. Rodar servidor
npm run dev
```

**✅ Se deu certo, você verá:**
```
🚀 Server running on port 3000
```

**Teste:** Abra http://localhost:3000/health
Deve retornar: `{"status":"ok",...}`

---

## 4️⃣ CONFIGURAR FRONTEND (3 min)

**Abra outro terminal** (deixe o backend rodando)
```bash
cd frontend

# 1. Instalar dependências
npm install

# 2. Criar arquivo .env
cp .env.example .env

# 3. Editar .env
notepad .env
```

**Cole isso:**
```bash
VITE_API_URL=http://localhost:3000/api
VITE_ENV=development
```
```bash
# 4. Rodar aplicação
npm run dev
```

**✅ Se deu certo, você verá:**
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:5173/
```

---

## 5️⃣ ACESSAR A APLICAÇÃO (1 min)

1. Abra navegador: **http://localhost:5173**
2. Clique em **Entrar** (login sem senha; apenas o e-mail `jvsp.ltda2@gmail.com` é aceito pelo backend).
3. 🎉 **Pronto!** Você está no Dashboard com seus ativos do seed.

---

## 🐛 PROBLEMAS COMUNS

### ❌ "Cannot find module '@prisma/client'"
```bash
cd backend
npx prisma generate
npm run dev
```

### ❌ "ECONNREFUSED localhost:3000"
- Backend não está rodando
- Rode: `cd backend && npm run dev`

### ❌ "Login failed"
- Seed não rodou
- Rode: `cd backend && npm run seed`

### ❌ "Port 3000 already in use"
- Outro programa usando porta 3000
- Mude em backend/.env: `PORT=3001`
- E em frontend/.env: `VITE_API_URL=http://localhost:3001/api`

### ❌ "Database connection failed"
- URL do Supabase errada
- Verifique DATABASE_URL no backend/.env
- Teste conexão: `cd backend && npx prisma studio`

---

## 📂 ESTRUTURA DE ARQUIVOS

Depois de configurar, você deve ter:
```
portfolio-commander/
├── backend/
│   ├── node_modules/  ✅
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── server.js
│   ├── .env  ✅ (criado por você)
│   └── package.json
│
└── frontend/
    ├── node_modules/  ✅
    ├── src/
    │   ├── components/
    │   ├── services/
    │   ├── utils/
    │   └── App.jsx
    ├── .env  ✅ (criado por você)
    └── package.json
```

---

## 🎓 PRÓXIMOS PASSOS

✅ **Tudo funcionando localmente?** 

Próximo tutorial: [📗 Deploy (Colocar Online)](DEPLOY.md)

---

## 💬 PRECISA DE AJUDA?

WhatsApp: +55 38 99824-0504
Email: jvsp.ltda2@gmail.com

---

**Tempo total gasto:** ~20 minutos ⏱️
**Status:** ✅ Aplicação rodando localmente!