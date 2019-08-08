#!/bin/bash
#
# run locally for dev
#

set -o errexit
set -o pipefail
set -o nounset

export COMMIT=local
export LASTMOD=$(date -u +%Y-%m-%dT%H:%M:%SZ)

#
# run in watch mode
#
npx nodemon
