# Build context = root repository (lihat docker-compose.yml) karena kode libs/ dipakai bersama.
# Tahap 1: build
FROM node:22-alpine AS builder
RUN apk add --no-cache openssl
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build:reservasi

# Tahap 2: runtime (ringan, hanya dependency produksi)
FROM node:22-alpine
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/dist/service-reservasi ./dist
USER node
EXPOSE 5002
CMD ["node", "dist/main"]
