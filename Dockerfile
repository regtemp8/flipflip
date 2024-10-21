ARG NODE_VERSION=20.0.0
FROM node:${NODE_VERSION}-alpine AS builder

WORKDIR /app
COPY ./common ./common
COPY ./client ./client
COPY ./server ./server

RUN corepack enable
RUN corepack prepare yarn@stable --activate

ENV NODE_ENV production

RUN cd ./common \
    && yarn install --immutable \
    && yarn build:main \
    && yarn build:module \
    && cd ../client \
    && yarn install --immutable \
    && yarn build \
    && cd ../server \
    && yarn install --immutable \
    && yarn build

# TODO add second build stage where copy from server/bin to ./ and client/dist to ./public