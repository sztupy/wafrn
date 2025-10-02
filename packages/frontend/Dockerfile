# Build stage
FROM node:24-alpine AS builder

ARG DOMAIN_NAME
ARG PDS_DOMAIN_NAME
ARG CACHE_DOMAIN
ARG MEDIA_DOMAIN
ARG ACME_EMAIL
ARG DOMAIN_NAME

ARG FRONTEND_SHORT_TITLE
ARG FRONTEND_LONG_TITLE
ARG FRONTEND_DESCRIPTION

ARG CACHE_HOST
ARG BACKEND_HOST

RUN apk add --no-cache perl curl tini bash git

WORKDIR /app/packages/frontend

COPY package.json /app
COPY package-lock.json /app

COPY packages/frontend/package.json .

# install dependencies
RUN npm install

COPY packages/frontend .

# Override frontend files with files put here. Allows easy overriding of assets, and potentially actual code as well
RUN cp -af /app/packages/frontend/overrides/* /app/packages/frontend/src || true

# ngsw config
RUN cp /app/packages/frontend/ngsw-config.json.example /app/packages/frontend/ngsw-config.json

RUN perl -pi -e 's/\$\{\{([_A-Z]+):-(.*)\}\}/$ENV{$1}||$2/ge' /app/packages/frontend/ngsw-config.json && \
  perl -pi -e 's/\$\{\{([_A-Z]+)\}\}/$ENV{$1}/g' /app/packages/frontend/ngsw-config.json

# copy the frontend environment file
RUN rm -rf src/environments/environment.prod.ts && mv src/environments/environment.docker.ts src/environments/environment.prod.ts

ENV NODE_ENV=production

RUN npm run build

RUN mv dist/wafrn/browser /app/frontend

COPY packages/frontend/Caddyfile.example /app/Caddyfile

RUN perl -pi -e 's/\$\{\{([_A-Z]+):-(.*)\}\}/$ENV{$1}||$2/ge' /app/Caddyfile && \
  perl -pi -e 's/\$\{\{([_A-Z]+)\}\}/$ENV{$1}/g' /app/Caddyfile

RUN perl -pi -e 's/\$\{\{([_A-Z]+):-(.*)\}\}/$ENV{$1}||$2/ge' /app/frontend/index.html && \
  perl -pi -e 's/\$\{\{([_A-Z]+)\}\}/$ENV{$1}/g' /app/frontend/index.html

FROM caddy:2

COPY packages/frontend/entrypoint.sh /entrypoint.sh
COPY --from=builder /app/Caddyfile /etc/caddy/Caddyfile
COPY --from=builder /app/frontend/ /app/frontend

ENTRYPOINT [ "/entrypoint.sh" ]

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
