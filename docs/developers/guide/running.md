# Running the project

## Running with mise (recommended)

The simplest way to run the app locally is with [mise](https://mise.jdx.dev/). The repository defines mise tasks in `.mise/tasks/`. mise installs the pinned tool versions (Python, Node, uv, etc.), creates `api/.venv` and loads `.env` automatically.

Before running for the first time, follow [Setup with mise](setup.md#setup-with-mise).

### Common tasks

| Command | Description |
|---------|-------------|
| `mise run serve` | Serve the full stack in Docker (`docker compose up --build`) |
| `mise run serve:api` | Serve the API locally on port 5000 (without Docker) |
| `mise run serve:web` | Serve the web app locally on port 3000 (without Docker) |
| `mise run test` | Run all tests |
| `mise run lint` | Run all linters, formatters and the TypeScript type check |
| `mise run install-dependencies` | Install API and web dependencies |

Run `mise tasks` to list all available tasks.

## Running with Docker Compose

To run the entire stack in containers, use Docker Compose. `mise run serve` runs `docker compose up --build`, which rebuilds the images and streams logs in the terminal, but Docker containers can also be started directly.

### Start all services

```sh
docker compose up -d
```

This starts three containers:

| Service | Port | Description |
|---------|------|-------------|
| **nginx** | [http://localhost:80](http://localhost:80) | Reverse proxy — main entry point |
| **api** | [http://localhost:5000](http://localhost:5000) | Flask API (debug mode) |
| **web** | [http://localhost:3000](http://localhost:3000) | Vite dev server |


## Running services individually

### API (without Docker)

```sh
cd api
uv sync # First time only
PYTHONPATH=src uv run flask --app src/app.py run --host=0.0.0.0
```

The API starts on `http://localhost:5000`.


### Web (without Docker)

```sh
cd web
npm install  # First time only
npm run start
```

The dev server starts on `http://localhost:3000`.

## Environment variables

### API

| Variable | Default | Description |
|----------|---------|-------------|
| `ENVIRONMENT` | — | Set to `development`, `test`, or `production` |
| `FLASK_DEBUG` | — | Set to `true` to enable Flask debug mode with auto-reload |
| `TABLE_KEY` | — | Azure Table Storage access key |
| `TABLE_ACCOUNT_NAME` | `lcmdevstorage` | Azure Storage account name |
| `APPINSIGHTS_CON_STRING` | — | Application Insights connection string |
| `LOAD_TEST_DATA` | `False` | Set to `True` to load test data instead of Azure data |
| `SYNC_BLOBS_APP_URL` | *(Logic App URL)* | URL to trigger the SharePoint sync Logic App |
| `AUTH_SECRET` | — | Secret for HS256 JWT validation (optional; falls back to RS256) |
| `AUTH_JWT_AUDIENCE` | `api://lost-circulation-material-api` | Expected JWT audience claim |
| `AUTH_JWK_URL` | `https://login.microsoftonline.com/common/discovery/v2.0/keys` | URL for fetching JSON Web Keys |

### Web (build-time)

| Variable | Description |
|----------|-------------|
| `VITE_CLIENT_ID` | Azure AD App Registration client ID |
| `VITE_SCOPES` | OAuth2 scopes requested by the frontend |
| `VITE_APPINSIGHTS_CON_STRING` | Application Insights connection string |
| `VITE_APPLICATION_OWNER` | Contact email shown in the application |
