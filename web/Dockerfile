FROM node:23-alpine AS base
ENV VITE_APPLICATION_OWNER=ovbra@equinor.com
ENV VITE_CLIENT_ID=1dbc1e96-268d-41ad-894a-92a9fb85f954
ENV VITE_SCOPES="api://lost-circulation-material-api/Optimization.All.All"
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
RUN export VITE_APPINSIGHTS_CON_STRING=$(echo $APPINSIGHTS_CON_STRING|base64 -d) && npm run build

FROM node:23-alpine AS prod
RUN npm install -g serve
COPY --from=build /code/build /code/build
EXPOSE 3000

USER 1000:1000
CMD ["serve", "--single", "/code/build", "--listen", "3000"]