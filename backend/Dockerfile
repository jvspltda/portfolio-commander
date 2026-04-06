# Migrações rodam no CMD (scripts/start-prod.js), não aqui — rede do build costuma não alcançar o Supabase.
FROM node:20-bookworm-slim

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install --omit=dev \
  && npx prisma generate

COPY . .

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "scripts/start-prod.js"]
