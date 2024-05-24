#!/bin/bash

echo 'Build common'
cd common
yarn install
yarn build:module
yarn build:main

echo 'Build client'
cd ../client
yarn install
yarn build

echo 'Build login'
cd ../login
npx update-browserslist-db@latest
yarn install
yarn build

echo 'Build server-details'
cd ../server-details
yarn install
yarn build

echo 'Make server'
cd ../server
yarn install
yarn make

cd ..
rm -rf common/node_modules
rm -rf client/node_modules
rm -rf login/node_modules
rm -rf server-details/node_modules
rm -rf server/node_modules