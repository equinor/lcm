FROM node:12-alpine as base
WORKDIR /code
ADD package.json yarn.lock /code/
RUN yarn install --frozen-lockfile
ADD ./ /code/

FROM base as development
CMD ["yarn", "start"]

FROM base as build
RUN yarn build

FROM node:12-alpine as prod
RUN npm install -g serve
COPY --from=build /code/build /code/build
EXPOSE 3000
CMD ["serve", "--single", "/code/build", "--listen", "3000"]