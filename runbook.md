# LCM Runbook

This document covers most operational information about the LCM Web app and API.

## Omnia Radix

The Web frontend and the API are deployed to Equinors Omnia Radix PaaS platform. This has it's own documentation available at [https://www.radix.equinor.com](https://www.radix.equinor.com). The configuration for our radix app is in `./radixconfig.yaml`. There is only one environment (`dev`). This is automatically deployed from every commit to the master branch on Github.

### TLS and DNS

The radix configuration handles management of TLS certificates as well as DNS entries. The main hostname is `https://lost-circulation-material.app.radix.equinor.com`. This serves the Single Page Application. The API is available under the `/api` location.

## SharePoint

The SharePoint site `https://statoilsrm.sharepoint.com/sites/LCMlibrary` is the main data provider for the application. Product metadata and product Particle Size Distribution (PSD) data is stored and updated here.  
For the link between product data and product Particle Size Distribution (PSD) to work, the name of the product in the "Product"-list, should match the PSD.xlsx-filename.

## Azure Resources

Resources outside of Radix and SharePoint are provided by Azure in the `S118-LCMlibrary-Standalone` subscription.

### App registration

One app registration `Lost Circulation Material`  

Authentication and authorization is handled by Azure Active Directory, which issues Access tokens that can be used as Java Web Tokens to access the protected API endpoints.

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
