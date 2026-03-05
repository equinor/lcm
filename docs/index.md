# Lost Circulation Material Optimizer

Welcome to the **LCM (Lost Circulation Material) Optimizer** documentation.

## About the project

LCM Optimizer is a web application for creating, comparing, and optimizing blending of lost circulation materials used to bridge fractures and stop losses in rock formations during petroleum drilling.

The application allows users to:

- **Optimize blends** — Run an optimizer that finds the best blend of products to match a theoretical bridging curve for a given fracture size.
- **Generate reports** — Export optimization results as PDF reports.
- **Synchronize data** — Keep product data in sync with the upstream SharePoint library.

## Architecture overview

The application consists of three main components, all deployed on [Equinor's Omnia Radix](https://www.radix.equinor.com) PaaS platform:

| Component | Technology | Description |
|-----------|------------|-------------|
| **Web** | React, TypeScript, Vite | Single Page Application providing the user interface |
| **API** | Python, Flask, Gunicorn | Backend service handling calculations, data access, and report generation |
| **Proxy** | Nginx | Reverse proxy routing traffic to the web and API components |

### Supporting services

- **Azure AD** — Authentication via OAuth 2.0 / OpenID Connect
- **Azure Table Storage** — Stores product PSD data
- **Azure Blob Storage** — Stores product metadata and PSD Excel files
- **Azure Logic App** — Synchronizes data from SharePoint to Azure Storage
- **Azure Application Insights** — Monitoring and telemetry (frontend and backend)

## Deployed environments

| Environment | URL | Branch |
|-------------|-----|--------|
| Test | <https://proxy-lost-circulation-material-test.radix.equinor.com> | `master` |
| Production | <https://lost-circulation-material.app.radix.equinor.com> | `prod` |

## Further reading

- [Developer Guide](developers/guide/index.md) — Setting up, running, and testing the project
- [Operator Runbook](operators/runbook/authentication.md) — Authentication, configuration, and deployment

## Links

- [GitHub Repository](https://github.com/equinor/lcm)
- [GitHub Project Board](https://github.com/orgs/equinor/projects/641)
- [Radix Console](https://console.radix.equinor.com/applications/lost-circulation-material)
- [Architecture Contract](https://github.com/equinor/architecturecontract/blob/master/contracts/LCMLibrary.md)
- [IT Application (Configuration Item)](https://equinor.service-now.com/selfservice?id=form&table=cmdb_ci_business_app&sys_id=156e5bbd93da29d0eaf1f4527cba10e4)
- [SharePoint LCM Library](https://statoilsrm.sharepoint.com/sites/LCMlibrary)

## License

This project is licensed under the [MIT License](../LICENSE).
