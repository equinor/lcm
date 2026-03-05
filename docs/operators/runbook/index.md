# Overview

_This document provides operational and administrative details for managing the LCM application, including deployments, updates, and incident responses. The primary audience is personnel responsible for managing and operating the system._

| Topic                                 | Description                                                    |
|---------------------------------------|----------------------------------------------------------------|
| [Architecture](architecture.md)       | Overview of system architecture, components, and interactions.  |
| [Authentication](authentication.md)   | Details on how authentication and authorization are implemented. |
| [Configuration](configuration.md)     | Details on system configuration, including secrets and settings. |
| [Deployment](deployment.md)           | Instructions for deploying updates and managing releases.       |
| [Operations](operations.md)           | Change management, updates and backups    |
| [Security](security.md)               | Security considerations, including vulnerability management.    |

### Permissions required

* **For Managing User Access**
  * To manage who can access the application, you need to be added as an owner to the [Enterprise Application][lcm-enterprise-app].
* **For Managing Radix**
  * To access the Radix console
    * Apply for the `Radix Platform Users` and `Radix Playground Users` through https://accessit.equinor.com
    * Added to the [Team Hermes Radix Admin][radix-admin-group] group that controls who can administrate the Radix application.
  * To change the `radixconfig.yaml` file
    * Added to the [GitHub repository][github-repository]
* **For Managing App registration**
  * Apply for the `Application Developer with Admin key` role through https://accessit.equinor.com
    * Need to be a certified developer to get this role.
  * Added as owners to the Azure [App Registration][app-registration]
* **For running deployments to Azure using Bicep**
  * Your `az_` account must have these roles (or greater) for the relevant subscription and resource group:
    * [Automation Contributor][automation-contributor]
    * [Managed Identity Contributor][managed-identity-contributor] (only when creating a Managed Identity with a Federated Credentials)
    * [Contributor][contributor] (only applicable when bootstrapping the common resource group)
    * [Application Developer][accessit-application-developer]
  * The `az_` account also needs to be a member of the group [AZAPPL S118 - Owner][lcm-owner-group].
    * It does not need to be an owner of the group, only a member.


### Competence required

* [Radix](https://www.radix.equinor.com)
* [GitHub Actions](https://docs.github.com/en/actions)
* [Azure](https://learn.microsoft.com/en-us/azure/)
* [npm](https://docs.npmjs.com/)
* [Docker](https://docs.docker.com/)
* [React](https://react.dev/)
* [Oauth2](https://oauth.net/2/)
* [Python](https://www.python.org/)
* [Pre-commit](https://pre-commit.com/)
* [Git](https://git-scm.com/)


## Platforms

> _Quick overview of platforms used._

- [ ] [DRM](https://drm.equinor.com/)
  - [ ] [Omnia Classic](https://docs.omnia.equinor.com/products/Service-Offerings/#omnia-classic)
  - [x] [Omnia Standalone](https://docs.omnia.equinor.com/products/Service-Offerings/#omnia-standalone)
    - [Azure subscription][azure-subscription] - All Azure resources are located under this subscription.
  - [x] [Omnia Radix](https://www.radix.equinor.com)
    - [Radix Console][radix-application-console] - The console for the application registered in Radix.

## Communication channels

> _Communication channels related to the application's operation._

- [Slack: Project Channel][slack-project-channel]


[lcm-radix-console]: https://console.radix.equinor.com/applications/lost-circulation-material
[radix-admin-group]: https://portal.azure.com/#view/Microsoft_AAD_IAM/GroupDetailsMenuBlade/~/Overview/groupId/13b319d8-ee25-4b6b-97db-74bad07d2057
[github-repository]: https://github.com/equinor/lost-circulation-material
[slack-project-channel]: https://equinor.enterprise.slack.com/archives/C0150KM2VD0
[app-registration]: https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/Overview/appId/1dbc1e96-268d-41ad-894a-92a9fb85f954/isMSAApp~/false
[lcm-owner-group]: https://portal.azure.com/#view/Microsoft_AAD_IAM/GroupDetailsMenuBlade/~/Overview/groupId/c2e76a65-53d6-4605-a54f-ac0e55920344
[lcm-enterprise-app]: https://portal.azure.com/#view/Microsoft_AAD_IAM/ManagedAppMenuBlade/~/Overview/objectId/e8f33fc2-ed9d-42ba-a8e1-44951d111671/appId/1dbc1e96-268d-41ad-894a-92a9fb85f954
[accessit-application-developer]: https://accessit.equinor.com/Search/Search?term=Application+Developer+with+Admin+key+%28AAD%29+%28MICROSOFT+ENTRA+ID%29
[automation-contributor]: https://portal.azure.com/?feature.msaljs=true#view/Microsoft_Azure_AD/RolePermissionsLandingBlade/allowRoleSelection~/false/priorityRoles~/%5B%5D/roleId/%2Fsubscriptions%2F467ce2f8-e948-4df0-b2ba-8b9b285dd237%2Fproviders%2FMicrosoft.Authorization%2FroleDefinitions%2Ff353d9bd-d4a6-484e-a77a-8050b599b867/scope/%2Fsubscriptions%2F467ce2f8-e948-4df0-b2ba-8b9b285dd237/showLinks~/false
[managed-identity-contributor]: https://portal.azure.com/#view/Microsoft_Azure_AD/RolePermissionsLandingBlade/allowRoleSelection~/false/priorityRoles~/%5B%5D/roleId/%2Fsubscriptions%2F467ce2f8-e948-4df0-b2ba-8b9b285dd237%2Fproviders%2FMicrosoft.Authorization%2FroleDefinitions%2Fe40ec5ca-96e0-45a2-b4ff-59039f2c2b59/scope/%2Fsubscriptions%2F467ce2f8-e948-4df0-b2ba-8b9b285dd237/showLinks~/false
[contributor]: https://portal.azure.com/#view/Microsoft_Azure_AD/RolePermissionsLandingBlade/allowRoleSelection~/false/priorityRoles~/%5B%5D/roleId/%2Fsubscriptions%2F467ce2f8-e948-4df0-b2ba-8b9b285dd237%2Fproviders%2FMicrosoft.Authorization%2FroleDefinitions%2Fb24988ac-6180-42a0-ab88-20f7382dd24c/scope/%2Fsubscriptions%2F467ce2f8-e948-4df0-b2ba-8b9b285dd237/showLinks~/false
