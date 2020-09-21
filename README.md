# Lost Circulation Material

![CI](https://github.com/equinor/lcm/workflows/CI/badge.svg)

This is the result from the merger of the two summer intern projects from 2020.
 - Team Blend https://github.com/equinor/LCMLibrary-Blend
 - Team Bridge https://github.com/equinor/LCMLibrary-Bridge

## Requirements

- [docker][]
- [docker compose][]

## Running

```bash
# Build containers
docker-compose build

# Start containers
docker-compose up
```

## Azure Resources

TODO: Explain how to re-create needed Azure resources.

## API Specification

The API follows [Equinor's API strategy][], and uses [OpenAPI, version 3][].

The API documentation can be found at http://localhost/api/ui/

### Generate API connectors

For the client you need to generate new stubs after changing the API code.

```bash
./generate-typescript.sh
```

To generate the stubs for client. The stubs are placed to `web/src/gen-api`.

## Update packages

### Web

You need yarn installed.

```
cd web
yarn update
```

### API

You need poetry installed.

```
cd api
poetry update
```

## Testing

### API

Run unit tests: `docker-compose run --rm api pytest`

## Tutorials

* [Azure Table storage](https://docs.microsoft.com/en-us/azure/cosmos-db/table-storage-how-to-use-python) 

 
[equinor's api strategy]: https://github.com/equinor/api-strategy/blob/master/docs/strategy.md
[openapi, version 3]: https://swagger.io/specification/
[docker]: https://www.docker.com/products/docker-desktop
[docker compose]: https://docs.docker.com/compose/

