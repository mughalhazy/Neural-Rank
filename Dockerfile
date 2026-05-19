FROM node:20-alpine

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY backend/ ./backend/
COPY scripts/ ./scripts/

USER appuser

EXPOSE 10000

CMD ["node", "backend/src/server.js"]
