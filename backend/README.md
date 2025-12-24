# Portfolio Commander - Backend

API REST para gerenciamento de portfólio de investimentos.

## 🚀 Quick Start

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar ambiente
```bash
# Copiar .env.example para .env
cp .env.example .env

# Editar .env e adicionar:
# - DATABASE_URL (do Supabase)
# - JWT_SECRET (gerar um secret seguro)
```

### 3. Configurar database
```bash
# Rodar migrations
npx prisma migrate dev

# Popular com dados iniciais (seus 26 ativos)
npm run seed
```

### 4. Rodar servidor
```bash
# Desenvolvimento (auto-reload)
npm run dev

# Produção
npm start
```

Servidor rodando em: http://localhost:3000