# Testing

## API tests

The API uses [pytest](https://docs.pytest.org/) as its test framework. Tests are located in `api/src/tests/`.



### Running tests

With mise:

```sh
mise run test:api
```

With Docker:

```sh
docker compose exec api pytest
```

Without Docker:

```sh
cd api
PYTHONPATH=src uv run pytest src/tests
```
