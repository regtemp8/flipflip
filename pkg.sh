#/bin/bash
set -e # exit on error (non-zero exit code)
set -x # print commands

export NODE_ENV=production

echo 'Building common'
cd ./common
rm -rf ./build
yarn install --immutable
yarn build:main
yarn build:module

echo 'Building client'
cd ../client
rm -rf ./dist
yarn install --immutable
yarn build

echo 'Building server'
cd ../server
rm -rf ./bin 
rm -rf ./dist
yarn install --immutable
yarn prod

echo 'Creating package'
mv ../client/dist bin/public/
yarn pkg -t node22-linux-x64 .

cd ..