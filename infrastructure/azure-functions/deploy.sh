#!/bin/bash
set -e

resource_group="${1:-spec-linter-api-dev}"

sighandler() {
  echo "aborting deployment"
  exit 1
}

trap sighandler SIGINT SIGTERM

docker build \
  -t postman-open-technologies/spec-linter-api-builder \
  -f Dockerfile-azure-build \
  ../..

container_id=$(docker run \
  --tty \
  --detach \
  --rm \
  postman-open-technologies/spec-linter-api-builder \
  /bin/bash)

docker cp \
  $container_id:/home/build/spec-linter-api.zip \
  ./build/spec-linter-api.zip

docker kill $container_id

az functionapp deployment source config-zip \
  --resource-group spec-linter-api-dev \
  --src ./build/spec-linter-api.zip \
  --name "$resource_group"
