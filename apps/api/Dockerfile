FROM node:20-slim AS builder
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
RUN npm install -g pnpm
COPY package.json ./
RUN pnpm install --no-frozen-lockfile
COPY . .
RUN ./node_modules/.bin/prisma generate
RUN ./node_modules/.bin/tsc -p tsconfig.build.json
RUN ls dist/src/main.js

FROM node:20-slim
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./
COPY prisma ./prisma
EXPOSE 4000
CMD sh -c "node_modules/.bin/prisma migrate deploy && node dist/src/main"
