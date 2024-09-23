# Build step
FROM node:20 AS builder

WORKDIR /app
COPY . .

RUN npm ci
RUN npm run build

# Server step
FROM nginx:stable-alpine AS production-stage
COPY --from=builder /app/dist /usr/share/nginx/html
