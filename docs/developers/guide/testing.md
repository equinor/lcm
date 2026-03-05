# Testing

## API tests

The API uses [pytest](https://docs.pytest.org/) as its test framework. Tests are located in `api/src/tests/`.



### Running tests

With Docker:

```sh
docker compose exec api poetry run pytest
```

Without Docker:

```sh
cd api
poetry run pytest
```
