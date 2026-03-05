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

> **Note:** These values are available in the `S118` Azure subscription.


