#!/bin/bash
#
# run locally for dev
#

set -o errexit
set -o pipefail
set -o nounset

#
# run in watch mode
#
npx nodemon
