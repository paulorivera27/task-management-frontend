FROM node:22.22.0-alpine3.23 AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.31.7-alpine

# Origin of the API (no path). Resolved at request time by nginx.
ENV BACKEND_URL=http://backend:80
ENV NGINX_ENTRYPOINT_LOCAL_RESOLVERS=1

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY nginx/security-headers.conf nginx/proxy.conf /etc/nginx/snippets/

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -q -O /dev/null http://127.0.0.1:3000/healthz || exit 1
