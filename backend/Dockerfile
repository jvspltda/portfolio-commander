# Migrações rodam no CMD (scripts/start-prod.js), não aqui — rede do build costuma não alcançar o Supabase.
# slim sem OpenSSL quebra o Prisma (SSL para Supabase) — ver aviso libssl/openssl.
FROM node:20-bookworm-slim

RUN apt-get update -y \
  && apt-get install -y openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install --omit=dev \
  && npx prisma generate

COPY . .

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "scripts/start-prod.js"]
