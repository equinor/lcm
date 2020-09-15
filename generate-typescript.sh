#!/usr/bin/env bash

API_VERSION=0.1.0

mkdir -p web/src/gen-api
docker run --rm \
    -v ${PWD}:/local \
    --user $(id -u):$(id -g) \
    openapitools/openapi-generator-cli generate \
    -i /local/api/openapi/api.yaml \
    -g typescript-fetch \
    -o /local/web/src/gen-api/ \
    --additional-properties=npmName=@equinor/lcm-api,npmVersion=${API_VERSION},typescriptThreePlus=true

#jq '.+{files: ["dist/**"], repository: {type: "git", url: "https://github.com/equinor/lcm"}}' gen/web/package.json | jq '.author = { name: "lcm", email: "lcm_team@equinor.com"}' > package-tmp.json
# mv package-tmp.json ./gen/web/package.json
# echo "//registry.npmjs.org/:_authToken=\${NPM_TOKEN}" > ./gen/web/.npmrc