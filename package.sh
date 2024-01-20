#!/bin/bash

echo 'Build client'
cd client
yarn build

echo 'Build login'
cd ../login
yarn build

echo 'Package server'
cd ../server
rm -rf public
cp -r ../client/build public
cp ../login/build/index.html public/login.html
cp -r ../login/build/static/js public/static
yarn package