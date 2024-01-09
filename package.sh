#!/bin/bash

cd client
yarn build

cd ../login
yarn build

cd ../server
rm -rf public
cp -r ../client/build public
cp ../login/build/index.html public/login.html
cp -r ../login/build/static/js public/static
yarn package