#!/bin/bash
#docker login -u oauth2accesstoken -p "$(gcloud auth print-access-token)" https://gcr.io

set -o errexit
set -o pipefail
set -o nounset

docker build -t vlz-one .
docker tag vlz-one:latest gcr.io/vectorlogozone/one:latest
docker push gcr.io/vectorlogozone/one:latest

gcloud beta run deploy vlz-one \
	--image gcr.io/vectorlogozone/one \
	--platform managed \
	--project vectorlogozone \
    --region us-central1 \
	--update-env-vars "COMMIT=$(git rev-parse --short HEAD),LASTMOD=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
