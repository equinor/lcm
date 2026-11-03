# Setting up the project

## Install Git hooks

With `pre-commit` installed, enable the repository's commit hooks in your clone:

```sh
pre-commit install
```

Each developer must run this once per clone (or rerun it after pulling this hook
configuration update) to install both `pre-commit` and `commit-msg` hooks.
The `no-commit-to-branch` hook runs at the `commit-msg` stage and blocks
commits on `master` and `main`, including commits with no files to check.
Create a feature branch before committing:

```sh
git switch -c chore/my-change
```

Commit messages must follow Conventional Commits, for example:

```text
chore: improve Git hooks
fix: handle missing telemetry configuration
```

The pre-commit checks include Python and frontend linting, file syntax checks,
whitespace and line-ending normalization, case conflicts, and private-key detection.

This is a local guardrail, not a replacement for GitHub branch protection.
`git commit --no-verify` bypasses the local hooks.


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
