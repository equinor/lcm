FROM node:18-alpine as base
ENV REACT_APP_APPLICATION_OWNER=ovbra@equinor.com
ENV REACT_APP_CLIENT_ID=1dbc1e96-268d-41ad-894a-92a9fb85f954
ENV REACT_APP_SCOPES="api://lost-circulation-material-api/Optimization.All.All"
ARG UID=1000

WORKDIR /code
ADD package.json yarn.lock /code/
RUN yarn install
ADD ./ /code/

FROM base as development
USER 1000:1000
CMD ["yarn", "start"]

FROM base as build
RUN yarn build

FROM node:18-alpine as prod
RUN npm install -g serve
COPY --from=build /code/build /code/build
EXPOSE 3000

USER 1000:1000
CMD ["serve", "--single", "/code/build", "--listen", "3000"]