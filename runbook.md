# LCM Runbook

This document covers most operational information about the LCM Web app and API.

## Links

- [Github repo](https://github.com/equinor/lcm)
- [GitHub Project](https://github.com/orgs/equinor/projects/641)
- [Architecture Contract](https://github.com/equinor/architecturecontract/blob/master/contracts/LCMLibrary.md)
- [IT Application (Configuration Item)](https://equinor.service-now.com/selfservice?id=form&table=cmdb_ci_business_app&sys_id=156e5bbd93da29d0eaf1f4527cba10e4)

## Prerequisites

> _List of all necessary permissions, or knowledge required to perform the tasks described in this runbook._

<details>
  <summary>Permissions required</summary>

* **For Managing User Access**
  * Added as owner to the [Enterprise registration](https://portal.azure.com/#view/Microsoft_AAD_IAM/ManagedAppMenuBlade/~/Overview/objectId/e8f33fc2-ed9d-42ba-a8e1-44951d111671/appId/1dbc1e96-268d-41ad-894a-92a9fb85f954).
* **For Managing Radix**
  * To access the Radix console
    * Apply for the `Radix Platform Users` and `Radix Playground Users` through https://accessit.equinor.com
    * Added to the [Team Hermes Radix Admin](https://portal.azure.com/#view/Microsoft_AAD_IAM/GroupDetailsMenuBlade/~/Overview/groupId/13b319d8-ee25-4b6b-97db-74bad07d2057) group that controls who can administrate the Radix application.
* **For Managing App registration**
  * Added as owners to the Azure [App registration](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/Overview/appId/1dbc1e96-268d-41ad-894a-92a9fb85f954/isMSAApp~/false)

</details>

<details>
  <summary>Competence required</summary>

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

</details>

## Architecture

![Diagram](doc/diagram.drawio.svg)

### Omnia Radix

The Web frontend and the API are deployed to Equinors Omnia Radix PaaS platform. This has its own documentation available at [https://www.radix.equinor.com](https://www.radix.equinor.com). The configuration for our radix app is in [radixconfig.yaml](./radixconfig.yaml).  
Two different environments in Radix are used: one for test (deploys from branch "master") and one for production (deploy from branch "prod"). Deploys will happen automatically when pushing to these branches.

#### TLS and DNS

The radix configuration handles management of TLS certificates as well as DNS entries. The main hostname is `https://lost-circulation-material.app.radix.equinor.com`. This serves the Single Page Application. The API is available under the `/api` location.

### SharePoint

The SharePoint site `https://statoilsrm.sharepoint.com/sites/LCMlibrary` is the main data provider for the application. Product metadata and product Particle Size Distribution (PSD) data is stored and updated here.  
For the link between product data and product Particle Size Distribution (PSD) to work, the name of the product in the "Product"-list, should match the PSD.xlsx-filename.

## Resources

> _List of all resources used by the application, including servers, databases, and cloud services._

<details>
  <summary>Radix</summary>

**Hosted applications**

| Name                                             | Description                          |
|--------------------------------------------------|--------------------------------------|
| [Radix Application](https://console.radix.equinor.com/applications/lost-circulation-material)   | The application registered in Radix. |

</details>

<details>
  <summary>Azure</summary>

**Subscriptions**

| Subscription                             | Description Group                                        |
|------------------------------------------|----------------------------------------------------------|
| [Azure subscription](https://portal.azure.com/#@StatoilSRM.onmicrosoft.com/resource/subscriptions/0a78ee8b-9e26-4088-9f6d-8de5fc5cd0ae/overview) | All Azure resources are located under this subscription. |

**App registrations**

| Name                                  | Description                                                       |
|---------------------------------------|-------------------------------------------------------------------|
| [App registration](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/Overview/appId/1dbc1e96-268d-41ad-894a-92a9fb85f954/isMSAApp~/false) | The application object registered in Azure for this application.  |

To make sure that the app registration are compliant:
* Add additional owner (to the Enterprise Application)
* Go to the `Branding & Properties` section and update the `Service Management Reference` to contain the App ID of the configuration item.

_In order for the application to be able to authenticate users, you need an Application Registration in Azure AD that can sign in users and issue tokens._

</details>

<details>
  <summary>Secrets, Certificates and Keys</summary>

> _Overview of all secrets and certificates used in the application._

**Application secrets**


| Name | Description | Used by | Obtained how |
|-----|-------------|---------|-------|
| TABLE_KEY         | For the API to create and read Particle Distribution Curves stored in Azure Table Storage        | API                    | "Access keys" in the Storage Account pane in Azure                |

</details>

### StorageAccount

#### Blob container

One container called `lcm-file-blobs`  
The SharePoint metadata list is stored here as "metadata.csv" as well as all the PSD .xlsx-documents for each product.

#### Tables

One table called `products`  
This table is recreated by the API from the blobs whenever the "Synchronize with SharePoint" function is called.

### Logic app

An _Azure Logic app_ is used to solve the problem of syncing files from SharePoint to blobs in the StorageAccount. This is not done directly by the API as there was some lacking permission features in the MS Graph API at the time.
It also translates a SharePoint List (Product) into a .csv file ("metadata.csv") that is loaded to blob storage.

Note: The access tokens used by the logic app can expire. If an "unauthorized error" occurs in the logic app, it can be fixed by:
1) Go to the TransferDocsToBlob resource in Azure.
2) Go to API connection.
3) Click on "sharepointonline" and click on edit API connection and "authorize". This will open a prompt where you have to log in with Equinor credentials.
4) Go back to the API connection list in the TransferDocsToBlob logic app and click on "azureblob" and "edit api connection". Under authorize, paste in the azure storage account access key (can be found inside the lcmdevstorage resource under the access keys tab).

### API Connection

Used to give the Logic app access to SharePoint and the StorageAccount.  
These are easiest created by the Logic app designer in the Azure portal.  
The function user `f_lcm_blend@statoil.net` is used for the SharePoint connection.


## Updating data
To synchronize data between Sharepoint and Azure, the user have to open the LCM web application and click the "Synchronize with Sharepoint" button. This will trigger the logic app to copy data from Sharepoint to Azure.

To add a new product, the user must:
1) Go to [Sharepoint](https://statoilsrm.sharepoint.com/sites/LCMlibrary).
2) Click on "Documents".
3) Open the folder for a given supplier and click on the PSD folder. Here you can create a new LCM PSD Excel Sheet by clicking on the "+ New" button.
4) Go back to [Sharepoint](https://statoilsrm.sharepoint.com/sites/LCMlibrary) and click on Products summary.
5) Click "+ New" and add metadata for the product. Note: it must have the same name as the newly created LCM PSD Excel Sheet. NB! it is important to add metadata about the new product. If not, the data will not be uploaded to Azure when doing data synchronization.
6) Open the LCM web application and click "Synchronize with Sharepoint".

## Deploy changes

| Environment            | Deployed how?                                                                            |
|------------------------|------------------------------------------------------------------------------------------|
| [Testing][https://proxy-lost-circulation-material-test.radix.equinor.com]    | Every commit to the `master` branch will be deployed automatically by Radix's "build-and-deploy"-feature|
| [Production][https://lost-circulation-material.app.radix.equinor.com] | Every commit to the `prod` branch will be deployed automatically by Radix's "build-and-deploy"-feature|

## Update packages

### Web

You need yarn installed.

```sh
cd web
yarn update
```

### API

You need poetry installed.

```sh
cd api
poetry update
```
