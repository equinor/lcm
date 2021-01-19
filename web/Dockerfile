FROM node:12-alpine as base
ENV REACT_APP_APPLICATION_OWNER=jmgo@equinor.com
ENV REACT_APP_CLIENT_ID=1dbc1e96-268d-41ad-894a-92a9fb85f954
ENV REACT_APP_SCOPES="api://lost-circulation-material-api/Optimization.All.All"
ARG UID=2000
ARG GID=2000


RUN addgroup -S usergroup -g $GID && adduser -u $UID -S nonrootuser -G usergroup && mkdir -p /app && chown -R nonrootuser /app
WORKDIR /code
ADD package.json yarn.lock /code/
RUN yarn install --frozen-lockfile
ADD ./ /code/

FROM base as development
USER nonrootuser 
CMD ["yarn", "start"]

FROM base as build
RUN yarn build

FROM node:12-alpine as prod
RUN npm install -g serve
COPY --from=build /code/build /code/build
EXPOSE 3000

CMD ["serve", "--single", "/code/build", "--listen", "3000"]