FROM node:25-alpine3.23 AS base
ENV VITE_APPLICATION_OWNER=ovbra@equinor.com
ARG APPINSIGHTS_CON_STRING

WORKDIR /code
ADD package.json package-lock.json /code/
RUN npm install
ADD ./ /code/

FROM base AS development

ENV VITE_APPINSIGHTS_CON_STRING=$APPINSIGHTS_CON_STRING
CMD ["npm","run", "start"]

FROM base AS build
ARG APPINSIGHTS_CON_STRING
RUN VITE_APPINSIGHTS_CON_STRING=$APPINSIGHTS_CON_STRING npm run build

# Production image (published as ghcr.io/equinor/lcm/nginx): serves the built SPA and
# reverse-proxies /api and /oauth2. Requires the build context `repository` pointing at the
# repo root, e.g. `docker build --build-context repository=. --target prod ./web`.
FROM nginxinc/nginx-unprivileged:1.31.7-alpine AS prod
COPY --from=repository nginx/config/ /etc/nginx/config/
COPY --from=repository nginx/nginx.prod.conf /etc/nginx/nginx.conf
COPY --from=build /code/build /usr/share/nginx/html
EXPOSE 8080