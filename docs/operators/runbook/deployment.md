# Deployment

This document describes how the LCM Optimizer is deployed and how to release new versions.

## Deployment platform

The application is deployed on [Omnia Radix](https://www.radix.equinor.com), Equinor's PaaS platform built on Kubernetes. Radix handles deployments, scaling, TLS certificates, and DNS management. Container images are built by GitHub Actions and published to GitHub Container Registry (`ghcr.io/equinor/lcm/*`); Radix only deploys them.

- **Radix Console**: [lost-circulation-material](https://console.radix.equinor.com/applications/lost-circulation-material)
- **Radix Config**: `radixconfig.yaml` in the repository root

### Environments

| Environment | Image tag | Deployment Process | URL |
|-------------|-----------|--------------------|-----|
| `dev` | `latest` | Automatically on every push to `master` | `https://nginx-lost-circulation-material-dev.radix.equinor.com` |
| `prod` | `production` | Automatically when a GitHub release is created by release-please (see [Releasing](#releasing)) | `https://lost-circulation-material.app.radix.equinor.com` |

### Radix components

| Component | Image | Port | Description |
|-----------|-------|------|-------------|
| `nginx` (public) | `ghcr.io/equinor/lcm/nginx` | 8080 | Serves the built SPA and proxies `/api` and `/oauth2`. Built from `web/Dockerfile` (target `prod`) with config from `nginx/`. |
| `api` | `ghcr.io/equinor/lcm/api` | 5000 | Flask API. Health probe: `/api/health`. |
| `oauth2-proxy` | `ghcr.io/equinor/lcm/oauth2-proxy` | 8081 | Handles login against Entra ID (BFF). |
| `redis` | `ghcr.io/equinor/lcm/redis` | 6379 | Session store for oauth2-proxy. |

### CI/CD flow

| Workflow | Trigger | What it does |
|----------|---------|--------------|
| `On PR updated` | Pull request | Runs `Test` (API unit tests, web build, pre-commit) |
| `Push to master branch` | Push to `master` | Runs tests, builds the optimizer report artifact, publishes images tagged `latest`, deploys to Radix `dev` |
| `Release Please` | Push to `master` | Maintains the release PR; when it is merged, creates the GitHub release and tag and calls `w: Deploy release` |
| `w: Deploy release` | Called by `Release Please`, or manually | Runs tests, publishes images tagged `production` and `vX.Y.Z`, deploys to Radix `prod` |
| `w: Deploy to Radix` | Called by the workflows above, or manually | `rx create pipeline-job deploy --environment <env>`, then verifies that `/api/about` returns the deployed commit hash |
| `workflow: Publish container images` | Called by the workflows above | Builds and pushes `api`, `nginx`, `oauth2-proxy` and `redis` images to `ghcr.io/equinor/lcm` |

## Releasing

Releases are managed by [release-please](https://github.com/googleapis/release-please). It reads [Conventional Commits](https://www.conventionalcommits.org/) on `master` (`feat:`, `fix:`, `feat!:` for breaking changes, ...) and decides the next version:

1. On every push to `master`, release-please creates or updates a PR named `chore(master): release X.Y.Z`. The PR bumps the version in `version.txt`, `api/pyproject.toml` and `web/package.json`, and updates `CHANGELOG.md`.
2. Review and merge the release PR when you want to release.
3. release-please creates the tag `vX.Y.Z` and the GitHub release, and `w: Deploy release` publishes the `production` images and deploys them to Radix `prod`.

Configuration lives in `.github/release-please-config.json` and `.github/.release-please-manifest.json`. To force a specific version, add a `Release-As: X.Y.Z` footer to a commit message on `master`.

To redeploy an existing release manually, run `w: Deploy release` with the release tag as input **and select the same tag under "Use workflow from"**. The images are rebuilt from the selected ref and tagged with the given release tag, so the workflow refuses to run if the two do not match.

## Secrets

Secrets are stored in Radix (no Key Vault). They are set per environment on each component page in the Radix web console, followed by a restart of the component.

| Secret | Component | Description |
|--------|-----------|-------------|
| `TABLE_KEY` | `api` | Azure Storage account access key (`lcmdevstorage`) |
| `APPINSIGHTS_CON_STRING` | `api` | Application Insights connection string |
| `SYNC_BLOBS_APP_URL` | `api` | Logic App HTTP trigger URL (contains SAS signature) |
| `CLIENT_SECRET` | `oauth2-proxy` | Client secret of the Entra ID app registration |
| `OAUTH2_PROXY_COOKIE_SECRET` | `oauth2-proxy` | Random 32-byte value used to encrypt sessions |
| `OAUTH2_PROXY_REDIS_PASSWORD` | `oauth2-proxy` | Must be identical to `REDIS_PASSWORD` |
| `REDIS_PASSWORD` | `redis` | Random password for Redis |

Generate random values with:

```bash
python3 -c 'import os,base64;print(base64.urlsafe_b64encode(os.urandom(32)).decode())'
```

The private image hub password (GitHub PAT with `read:packages`) for `ghcr.io` is also set in the Radix console under the application configuration.

### GitHub configuration

| Name | Type | Scope | Description |
|------|------|-------|-------------|
| `AZURE_CLIENT_ID` | Variable | Environment `deploy-to-radix` | Client ID of an identity with a federated credential for this repository, registered as admin of the Radix application |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | Variable | Environments `dev` and `production` | Baked into the frontend at build time |
| `DEV_DEPLOY_URL` / `PROD_DEPLOY_URL` | Variable (optional) | Environment `check-radix-deployment` | Override the URLs used by the deployment check (without trailing slash) |
| `APP_CLIENT_ID` | Variable | Repository | Client ID of the GitHub App used by release-please |
| `APP_PRIVATE_KEY` | Secret | Repository | Private key of the GitHub App used by release-please |

GitHub environments and their protection rules:

| Environment | Used by | Configuration |
|-------------|---------|---------------|
| `deploy-to-radix` | `w: Deploy to Radix` | Holds `AZURE_CLIENT_ID`. The subject of the Azure federated credential is `repo:equinor/lcm:environment:deploy-to-radix` |
| `check-radix-deployment` | `w: Deploy to Radix` | Wait timer: 5 minutes, so Radix has time to roll out before the deployment check runs |
| `dev` / `production` | `workflow: Publish container images` | Hold `APPLICATIONINSIGHTS_CONNECTION_STRING` for the frontend build |

### GitHub App for release-please

release-please needs a token other than the default `GITHUB_TOKEN`, otherwise the release PR does not trigger the test workflow and the release tag does not trigger a deployment.

1. Create a GitHub App in the Equinor organization (**Organization settings → Developer settings → GitHub Apps → New GitHub App**). Disable webhooks. Repository permissions: **Contents: Read and write**, **Pull requests: Read and write**, **Issues: Read and write**, **Metadata: Read-only**.
2. Install the app on the `equinor/lcm` repository.
3. Generate a private key for the app.
4. In the repository, add the variable `APP_CLIENT_ID` (the app's client ID) and the secret `APP_PRIVATE_KEY` (the full content of the `.pem` file).

### Entra ID redirect URIs

The app registration used by oauth2-proxy must have these redirect URIs:

- `https://nginx-lost-circulation-material-dev.radix.equinor.com/oauth2/callback`
- `https://lost-circulation-material.app.radix.equinor.com/oauth2/callback`

## Certificates

No application-managed certificates are currently in use. TLS is handled by the Radix platform.

## Monitoring deployments

- **Radix Console**: View build logs, deployment status, and replica health
- **Application Insights**: Monitor request performance, errors, and custom events
- **Radix logs**: View container stdout/stderr logs in real time

## Access requirements

To deploy and manage the application in Radix, you need:

1. `Radix Platform Users` roles — apply via [AccessIT](https://accessit.equinor.com)
2. Membership in the [Team Hermes Radix Admin](https://portal.azure.com/#view/Microsoft_AAD_IAM/GroupDetailsMenuBlade/~/Overview/groupId/13b319d8-ee25-4b6b-97db-74bad07d2057) group
