#/bin/bash

export SERVER_PORT=5050
export FF_PORT=5050
export NODE_ENV=production

echo 'Building common'
cd ./common
yarn install --immutable
yarn build:main
yarn build:module

echo 'Building client'
cd ../client
yarn install --immutable
yarn build

echo 'Building server'
cd ../server
rm -rf ./bin 
yarn install --immutable
yarn prod
mv ../client/dist bin/public/
echo 'Creating package'
yarn pkg .

cd ..