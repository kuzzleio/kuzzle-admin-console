FROM kuzzleio/kuzzle-runner:16 as build-stage
WORKDIR /app
COPY package*.json ./
RUN NODE_ENV=production npm install
COPY . .
RUN npm run build

# production stage
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
