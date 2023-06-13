# LCM Runbook

This document covers most operational information about the LCM Web app and API.

![Diagram](diagram.drawio.svg)

## Omnia Radix

The Web frontend and the API are deployed to Equinors Omnia Radix PaaS platform. This has it's own documentation available at [https://www.radix.equinor.com](https://www.radix.equinor.com). The configuration for our radix app is in [radixconfig.yaml](./radixconfig.yaml). There is only one environment (`dev`). This is automatically deployed from every commit to the master branch on Github.

### TLS and DNS

The radix configuration handles management of TLS certificates as well as DNS entries. The main hostname is `https://lost-circulation-material.app.radix.equinor.com`. This serves the Single Page Application. The API is available under the `/api` location.

## SharePoint

The SharePoint site `https://statoilsrm.sharepoint.com/sites/LCMlibrary` is the main data provider for the application. Product metadata and product Particle Size Distribution (PSD) data is stored and updated here.  
For the link between product data and product Particle Size Distribution (PSD) to work, the name of the product in the "Product"-list, should match the PSD.xlsx-filename.

### Updating data
To synchronize data between Sharepoint and Azure, the user have to open the LCM web application and click the "Synchronize with Sharepoint" button. This will trigger the logic app to copy data from Sharepoint to Azure.

To add a new product, the user must:
1) Go to [Sharepoint](https://statoilsrm.sharepoint.com/sites/LCMlibrary).
2) Click on "Documents".
3) Open the folder for a given supplier and click on the PSD folder. Here you can create a new LCM PSD Excel Sheet by clicking on the "+ New" button.
4) Go back to [Sharepoint](https://statoilsrm.sharepoint.com/sites/LCMlibrary) and click on Products summary.
5) Click "+ New" and add metadata for the product. Note: it must have the same name as the newly created LCM PSD Excel Sheet. NB! it is important to add metadata about the new product. If not, the data will not be uploaded to Azure when doing data synchronization.
6) Open the LCM web application and click "Synchronize with Sharepoint".


## Azure Resources

Resources outside of Radix and SharePoint are provided by Azure in the `S118-LCMlibrary-Standalone` subscription.

### App registration

One app registration `Lost Circulation Material`  

Authentication and authorization is handled by Azure Active Directory, which issues Access tokens that can be used as Java Web Tokens to access the protected API endpoints.

#### Granting and removing access

1. Navigate to the [Azure Portal](https://portal.azure.com) (logged in with an Equinor account)
2. Select/Search for the service called _Enterprise Application_
3. Find the application called _Lost Circulation Material_
4. In the left pane, select _Users and groups_
5. Here you can add new users and groups, or remove existing ones

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
