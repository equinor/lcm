FROM node:23-alpine AS base
ENV VITE_APPLICATION_OWNER=ovbra@equinor.com
ENV VITE_CLIENT_ID=1dbc1e96-268d-41ad-894a-92a9fb85f954
ENV VITE_SCOPES="api://lost-circulation-material-api/Optimization.All.All"
ARG UID=1000

WORKDIR /code
ADD package.json package-lock.json /code/
RUN npm install
ADD ./ /code/

FROM base AS development
RUN chown -R ${UID}:${UID} /code
USER 1000:1000
CMD ["npm","run", "start"]

FROM base AS build
RUN npm run build

FROM node:23-alpine AS prod
RUN npm install -g serve
COPY --from=build /code/build /code/build
EXPOSE 3000

USER 1000:1000
CMD ["serve", "--single", "/code/build", "--listen", "3000"]