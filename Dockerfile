# 1. Étape de build
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

# 2. Étape finale (production)
FROM node:22-alpine
WORKDIR /app

RUN addgroup --system --gid 1001 appuser && adduser --system --uid 1001 appuser

# Copier uniquement les fichiers de configuration des paquets
COPY package.json package-lock.json ./

# Installer SEULEMENT les dépendances de production
RUN npm ci --omit=dev --legacy-peer-deps

COPY --from=builder /app/.next ./.next

RUN chown -R appuser:appuser /app
USER appuser

EXPOSE 3000
CMD ["npx", "next", "start"]
