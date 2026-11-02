# Setting up the project


## Configure environment variables

Create a copy of the environment template and populate it with the required values:

```sh
cp .env-template .env
```

Open `.env` in your editor and fill in the following variables:

| Variable | Description | Where to find it |
|----------|-------------|------------------|
| `TABLE_KEY` | Access key for Azure Table Storage | Azure Portal → `lcmdevstorage` → Access keys |
| `APPINSIGHTS_CON_STRING` | Application Insights connection string | Azure Portal → Application Insights resource → Properties |
| `AUTH_CLIENT_SECRET` | Client secret used by oauth2-proxy to sign in with Entra ID | Azure Portal → Microsoft Entra ID → App registrations → client ID `1dbc1e96-268d-41ad-894a-92a9fb85f954` → Certificates & secrets |

> **Note:** `TABLE_KEY` and `APPINSIGHTS_CON_STRING` are available in the `S118` Azure subscription.

If `AUTH_CLIENT_SECRET` is missing or wrong, signing in at `http://localhost` fails with a `500 Internal Server Error` from oauth2-proxy.
