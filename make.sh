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
