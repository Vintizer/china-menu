# Stage 1: build frontend
FROM node:20-alpine AS builder

WORKDIR /app

# Vite вшивает эти переменные в бандл при сборке
ARG VITE_BOT_TOKEN
ARG VITE_ADMIN_CHAT_ID
ENV VITE_BOT_TOKEN=$VITE_BOT_TOKEN
ENV VITE_ADMIN_CHAT_ID=$VITE_ADMIN_CHAT_ID

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: production
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY server ./server
COPY api ./api
COPY shared ./shared

EXPOSE 3000

CMD ["node", "server/index.js"]
