FROM node:23-alpine AS base
ENV REACT_APP_APPLICATION_OWNER=ovbra@equinor.com
ENV REACT_APP_CLIENT_ID=1dbc1e96-268d-41ad-894a-92a9fb85f954
ENV REACT_APP_SCOPES="api://lost-circulation-material-api/Optimization.All.All"
ARG UID=1000

WORKDIR /code
ADD package.json yarn.lock /code/
RUN yarn install
ADD ./ /code/

FROM base AS development
USER 1000:1000
CMD ["yarn", "start"]

FROM base AS build
RUN yarn build

FROM node:23-alpine AS prod
RUN npm install -g serve
COPY --from=build /code/build /code/build
EXPOSE 3000

USER 1000:1000
CMD ["serve", "--single", "/code/build", "--listen", "3000"]