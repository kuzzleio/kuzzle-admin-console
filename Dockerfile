FROM kuzzleio/kuzzle-runner:12 AS build-stage
WORKDIR /app
COPY package*.json ./
RUN NODE_ENV=production npm install
COPY . .
RUN npm run build

# security stage
FROM alpine:latest AS security-stage
ARG DOMAIN_NAME=localhost
ARG DAYS_VALID=180

RUN apk add --no-cache openssl
RUN echo "Creating self-signed certificate valid for ${DAYS_VALID} days for domain ${DOMAIN_NAME}" && \
    openssl \
    req -x509 \
    -nodes \
    -subj "/CN=${DOMAIN_NAME}" \
    -addext "subjectAltName=DNS:${DOMAIN_NAME}" \
    -days ${DAYS_VALID} \
    -newkey rsa:2048 -keyout /tmp/self-signed.key \
    -out /tmp/self-signed.crt

# production stage
FROM nginx:stable-alpine AS production-stage
ARG DOMAIN_NAME=localhost
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY --from=security-stage /tmp/self-signed.key /etc/ssl/private
COPY --from=security-stage /tmp/self-signed.crt /etc/ssl/certs
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen       80;
    listen  [::]:80;
    listen 443 ssl;
    listen [::]:443 ssl;
    ssl_certificate /etc/ssl/certs/self-signed.crt;
    ssl_certificate_key /etc/ssl/private/self-signed.key;
    server_name $DOMAIN_NAME;

    location / {
        root   /usr/share/nginx/html;
        index  index.html index.htm;
    }

    error_page  404              /404.html;
    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }
}
EOF
EXPOSE 80
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]
