#!/bin/bash
#
# run locally for dev
#

set -o errexit
set -o pipefail
set -o nounset

# make sure npm packages are installed if there is no node_modules folder
if [ ! -d "node_modules" ]; then
  npm install
fi


export COMMIT=local
export LASTMOD=$(date -u +%Y-%m-%dT%H:%M:%SZ)

#
# run in watch mode
#
npx nodemon
