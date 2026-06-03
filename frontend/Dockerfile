FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# 移除 ARG/ENV 避免覆蓋 .env.production 的值

RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

# 只複製運行所需檔案
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 8080

# Cloud Run 會提供 PORT 變數，Next.js 啟動腳本可以讀取
ENV PORT=8080

CMD ["npm", "start"]
