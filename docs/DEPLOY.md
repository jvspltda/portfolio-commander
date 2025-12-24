# 📗 Deploy - Portfolio Commander

Como colocar sua aplicação online **GRÁTIS**.

## 🌐 SERVIÇOS GRATUITOS

- **Vercel** → Frontend (React)
- **Railway** → Backend (Node.js)
- **Supabase** → Database (PostgreSQL)

**Custo total:** R$ 0,00/mês

---

## 1️⃣ DEPLOY DO DATABASE (JÁ FEITO!)

Se você seguiu o SETUP.md, seu database já está no Supabase! ✅

---

## 2️⃣ DEPLOY DO BACKEND (Railway)

### **Criar conta Railway:**

1. Acesse: https://railway.app
2. Clique em "Start a New Project"
3. Login com GitHub
4. Autorize o Railway

### **Fazer deploy:**

1. No Railway, clique em **"New Project"**
2. Escolha **"Deploy from GitHub repo"**
3. Conecte sua conta GitHub
4. Selecione o repositório `portfolio-commander`
5. Railway detecta automaticamente Node.js
6. Clique em **"Deploy"**

### **Configurar variáveis de ambiente:**

1. No projeto Railway, clique em **"Variables"**
2. Adicione estas variáveis:
```
DATABASE_URL=sua-url-do-supabase
JWT_SECRET=seu-secret-super-seguro
USER_EMAIL=jvsp.ltda2@gmail.com
USER_PASSWORD=dick1010
FRONTEND_URL=https://seu-app.vercel.app
TZ=America/Sao_Paulo
PORT=3000
NODE_ENV=production
```

3. Clique em **"Deploy"** novamente

### **Pegar URL do backend:**

1. Vá em **"Settings"**
2. Procure **"Domains"**
3. Clique em **"Generate Domain"**
4. Copie a URL (ex: `portfolio-backend.up.railway.app`)

✅ **Backend online!**

---

## 3️⃣ DEPLOY DO FRONTEND (Vercel)

### **Instalar Vercel CLI:**
```bash
npm install -g vercel
```

### **Fazer deploy:**
```bash
cd frontend

# Login
vercel login

# Deploy
vercel
```

Responda as perguntas:
- **Set up and deploy?** → Y
- **Which scope?** → [sua conta]
- **Link to existing project?** → N
- **Project name?** → portfolio-commander
- **Directory?** → ./
- **Override settings?** → N

### **Configurar variáveis:**
```bash
vercel env add VITE_API_URL
```

Cole a URL do Railway (ex: `https://portfolio-backend.up.railway.app/api`)

### **Deploy de produção:**
```bash
vercel --prod
```

✅ **Frontend online!**

Você receberá uma URL tipo: `https://portfolio-commander.vercel.app`

---

## 4️⃣ ATUALIZAR CORS NO BACKEND

1. Volte no **Railway**
2. Vá em **Variables**
3. Atualize `FRONTEND_URL` com a URL do Vercel
4. **Redeploy**

---

## 5️⃣ TESTAR APLICAÇÃO ONLINE

1. Abra a URL do Vercel
2. Faça login:
   - Email: jvsp.ltda2@gmail.com
   - Senha: dick1010
3. 🎉 **Aplicação online e funcionando!**

---

## 🔄 ATUALIZAR CÓDIGO

Quando fizer mudanças:
```bash
# Backend (Railway)
git add .
git commit -m "Update"
git push
# Railway faz deploy automático!

# Frontend (Vercel)
cd frontend
vercel --prod
```

---

## 💰 CUSTOS

| Serviço | Plano | Custo |
|---------|-------|-------|
| Vercel | Hobby | R$ 0 |
| Railway | Starter | R$ 0 |
| Supabase | Free | R$ 0 |

**Total:** R$ 0/mês 🎉

---

## 📊 LIMITES GRATUITOS

- **Vercel:** 100GB bandwidth/mês
- **Railway:** 500 horas/mês
- **Supabase:** 500MB database

**Suficiente para uso pessoal!**

---

## 💬 PROBLEMAS?

WhatsApp: +55 38 99824-0504