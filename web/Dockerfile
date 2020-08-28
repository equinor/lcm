FROM node:12-alpine as base
WORKDIR /code
RUN npm install -g serve
COPY package.json yarn.lock /code/
RUN yarn install --frozen-lockfile
COPY ./ /code/

FROM base as development
CMD ["yarn", "start"]

FROM base as prod
RUN yarn build
EXPOSE 3000
CMD ["serve", "--single", "build", "--listen", "3000"]
