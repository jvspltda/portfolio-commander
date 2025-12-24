# 📕 API Documentation - Portfolio Commander

Documentação completa dos endpoints da API.

## 🔐 Autenticação

Todos os endpoints (exceto `/auth/login`) requerem token JWT no header:
```
Authorization: Bearer {token}
```

---

## 🔑 AUTH

### POST /api/auth/login

Fazer login e receber token JWT.

**Request:**
```json
{
  "email": "jvsp.ltda2@gmail.com",
  "password": "dick1010"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "jvsp.ltda2@gmail.com",
    "name": "João Victor"
  }
}
```

### GET /api/auth/me

Verificar token e obter dados do usuário.

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "jvsp.ltda2@gmail.com",
    "name": "João Victor"
  }
}
```

---

## 💼 ASSETS

### GET /api/assets

Listar todos os ativos do usuário.

**Response:**
```json
[
  {
    "id": 1,
    "ticker": "BTC",
    "name": "Bitcoin",
    "carteira": "B",
    "tipo": "Cripto",
    "quantidade": 0.244,
    "precoEntrada": 89000,
    "precoAtual": 90200,
    "currency": "USD"
  }
]
```

### POST /api/assets

Criar novo ativo.

**Request:**
```json
{
  "ticker": "PETR4",
  "name": "Petrobras",
  "carteira": "A",
  "tipo": "Ação BR",
  "quantidade": 100,
  "precoEntrada": 35.50,
  "precoAtual": 36.20,
  "currency": "BRL",
  "corretora": "XP"
}
```

### PUT /api/assets/:id

Atualizar ativo.

### DELETE /api/assets/:id

Remover ativo (soft delete).

### GET /api/assets/portfolio/summary

Resumo do portfólio.

**Response:**
```json
{
  "totalA": 800000,
  "totalB": 200000,
  "total": 1000000,
  "lucroA": 50000,
  "lucroB": 30000,
  "lucroTotal": 80000
}
```

---

## 🔔 ALERTS

### GET /api/alerts

Listar alertas do usuário.

### POST /api/alerts

Criar novo alerta.

**Request:**
```json
{
  "assetId": 1,
  "tipo": "preco",
  "condicao": ">",
  "valorGatilho": 130000,
  "acaoSugerida": "Vender 20%"
}
```

### PUT /api/alerts/:id/toggle

Ativar/desativar alerta.

### DELETE /api/alerts/:id

Remover alerta.

---

## 📬 NOTIFICATIONS

### GET /api/notifications

Listar notificações.

### PUT /api/notifications/:id/read

Marcar como lida.

### PUT /api/notifications/read-all

Marcar todas como lidas.

---

## 🌐 BASE URL

- **Local:** `http://localhost:3000/api`
- **Produção:** `https://seu-app.railway.app/api`