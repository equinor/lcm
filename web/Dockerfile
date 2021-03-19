FROM node:12-alpine as base
ENV REACT_APP_APPLICATION_OWNER=ovbra@equinor.com
ENV REACT_APP_CLIENT_ID=1dbc1e96-268d-41ad-894a-92a9fb85f954
ENV REACT_APP_SCOPES="api://lost-circulation-material-api/Optimization.All.All"
ARG UID=1001
ARG GID=1001


RUN addgroup -S usergroup -g $GID && adduser -u $UID -S nonrootuser -G usergroup
WORKDIR /code
ADD package.json yarn.lock /code/
RUN yarn install
ADD ./ /code/

FROM base as development
USER nonrootuser 
CMD ["yarn", "start"]

FROM base as build
RUN yarn build

FROM node:12-alpine as prod
ARG UID=1001
ARG GID=1001
RUN addgroup -S usergroup -g $GID && adduser -u $UID -S nonrootuser -G usergroup
RUN npm install -g serve
COPY --from=build /code/build /code/build
EXPOSE 3000

USER nonrootuser 
CMD ["serve", "--single", "/code/build", "--listen", "3000"]