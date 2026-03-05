# Deployment

This document describes how the LCM Optimizer is deployed and how to release new versions.

## Deployment platform

The application is deployed on [Omnia Radix](https://www.radix.equinor.com), Equinor's PaaS platform built on Kubernetes. Radix handles container builds, deployments, scaling, TLS certificates, and DNS management.

- **Radix Console**: [lost-circulation-material](https://console.radix.equinor.com/applications/lost-circulation-material)
- **Radix Config**: `radixconfig.yaml` in the repository root

### Branch-to-environment mapping

| Environment | Deployment Process | URL |
|-------------|-----------------|-----|
| `test` | Automatically reflects the latest changes in `master` branch | `https://proxy-lost-circulation-material-test.radix.equinor.com` |
| `prod` | Promoted manually from Test via the Radix web console. | `https://lost-circulation-material.app.radix.equinor.com` |


## Secrets

The following secrets must be configured per environment in the Radix console:

| Secret | Component | Description |
|--------|-----------|-------------|
| `TABLE_KEY` | API | Azure Table Storage access key |
| `APPINSIGHTS_CON_STRING` | API | Application Insights connection string |


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
