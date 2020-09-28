FROM node:12-alpine as base
WORKDIR /code
RUN npm install -g serve
ADD package.json yarn.lock /code/
RUN yarn install --frozen-lockfile
ADD ./ /code/

FROM base as development
CMD ["yarn", "start"]

FROM base as prod
RUN yarn build
EXPOSE 3000
CMD ["serve", "--single", "build", "--listen", "3000"]
