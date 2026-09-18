# Build step
FROM node:24-bookworm-slim AS builder

WORKDIR /app
COPY . .

RUN npm ci
RUN npm run build

# Server step
FROM nginx:1.27 AS production-stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
