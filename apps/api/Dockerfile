FROM node:20-slim
WORKDIR /app
RUN npm install -g pnpm
COPY package.json ./
RUN pnpm install --no-frozen-lockfile
COPY . .
RUN npx prisma generate
RUN pnpm run build
EXPOSE 4000
CMD sh -c "npx prisma migrate deploy && node dist/main"
