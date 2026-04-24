# Stage 1: install dependancies
FROM oven/bun:1-alpine AS deps

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production


# Stage 2: build image for production
FROM oven/bun:1-alpine AS production

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./
COPY --from=deps /app/bun.lock ./

COPY . .

ARG APP_USER=lahatra3
ARG APP_UID=1001

RUN addgroup -g ${APP_UID} ${APP_USER} && \
    adduser -u ${APP_UID} -G ${APP_USER} -s /sbin/nologin -D ${APP_USER}

USER ${APP_USER}

ENV NODE_ENV=production

EXPOSE 3131/tcp

ENTRYPOINT [ "bun", "run", "start" ]
