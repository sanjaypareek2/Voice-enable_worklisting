FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --production
COPY . .
ENV DATABASE_URL="file:./dev.db"
RUN npm run build || true
CMD ["node", "dist/index.js"]
