ARG SERVER_PORT="8080"
ARG NODE_ENV="production"

FROM node:20-alpine AS builder
ARG SERVER_PORT
ARG NODE_ENV

RUN corepack enable
RUN corepack prepare yarn@stable --activate

COPY --chown=node:node . /home/node/builder

WORKDIR /home/node/builder/common
RUN yarn install --immutable
RUN yarn build:main
RUN yarn build:module

WORKDIR /home/node/builder/client
RUN yarn install --immutable
RUN yarn build

WORKDIR /home/node/builder/server
RUN yarn install --immutable
RUN yarn prod

FROM node:20-alpine
ARG SERVER_PORT
ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV
ENV FF_PORT=$SERVER_PORT
ENV FF_USERNAME=admin
ENV FF_PASSWORD=admin

COPY --chown=node:node ./server/package.json /home/node/server/
COPY --chown=node:node --from=builder /home/node/builder/server/bin /home/node/server
COPY --chown=node:node --from=builder /home/node/builder/client/dist /home/node/server/public
COPY --chown=node:node --from=builder /home/node/builder/common/build/main /home/node/common
WORKDIR /home/node/server

RUN corepack enable
RUN corepack prepare yarn@stable --activate
RUN yarn workspaces focus --production

EXPOSE ${SERVER_PORT}
ENTRYPOINT ["yarn", "node", "./server.js"]