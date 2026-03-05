# Configuration

This document describes the system resources and configuration used by the LCM Optimizer.

## Azure resources

All Azure resources are located under the [S118 subscription](https://portal.azure.com/#@StatoilSRM.onmicrosoft.com/resource/subscriptions/0a78ee8b-9e26-4088-9f6d-8de5fc5cd0ae/overview).

### Storage Account (`lcmdevstorage`)

#### Blob container

- **Container name**: `lcm-file-blobs`
- **Contents**:
  - `metadata.csv` — Product metadata exported from the SharePoint list
  - Individual `.xlsx` files — Particle Size Distribution (PSD) data per product

#### Table Storage

- **Table name**: `products`
- **Purpose**: Stores processed product data used by the API. This table is rebuilt from the blob data whenever the "Synchronize with SharePoint" function is called.

### Application Insights

Provisioned via Bicep (IaC) in `IaC/main.bicep`.

| Resource | Description |
|----------|-------------|
| **Log Analytics Workspace** | `lcm-<env>-logWorkspace` — Backend log aggregation |
| **Application Insights** | `lcm-<env>-logs` — Telemetry for both frontend and backend |


#### Logging details

- **Frontend**: Tracks loading of `Main.tsx` via custom events. Query `customEvents` in Application Insights.
- **Backend**: Every request is logged via OpenTelemetry instrumentation. Query `requests` in Application Insights.

### Logic App
An _Azure Logic app_ is used to solve the problem of syncing files from SharePoint to blobs in the StorageAccount. This is not done directly by the API as there was some lacking permission features in the MS Graph API at the time.
It also translates a SharePoint List (Product) into a .csv file ("metadata.csv") that is loaded to blob storage.

- **Resource**: `TransferDocsToBlob`
- **Purpose**: Synchronizes files and metadata from SharePoint to Azure Blob Storage
- **Trigger**: HTTP (called by the API when the user clicks "Synchronize with SharePoint")

The Logic App:

1. Copies PSD `.xlsx` documents from SharePoint to the `lcm-file-blobs` blob container
2. Translates the SharePoint "Product" list into `metadata.csv` and uploads it to the same container

#### API Connections

The Logic App uses two API connections:

| Connection | Purpose | Authentication |
|------------|---------|----------------|
| `sharepointonline` | Access to the SharePoint site | Equinor credentials (function user `f_lcm_blend@statoil.net`) |
| `azureblob` | Access to the Storage Account | Storage Account access key |

> **Troubleshooting**: If the Logic App returns "unauthorized" errors, the API connection tokens may have expired. See the [Reauthorizing Logic App connections](#reauthorizing-logic-app-connections) section below.


### SharePoint
The SharePoint site is the main data provider for the application. Product metadata and product Particle Size Distribution (PSD) data is stored and updated here.

- **Site**: `https://statoilsrm.sharepoint.com/sites/LCMlibrary`
- **Purpose**: Primary data source for product information

> **Important**: For the link between product metadata and PSD data to work, the product name in the SharePoint "Product" list must exactly match the corresponding `.xlsx` filename.


### Secrets (Radix)

The following secrets must be configured in the Radix console:

| Secret | Used by | Description |
|--------|---------|-------------|
| `TABLE_KEY` | API | Azure Table Storage access key |
| `APPINSIGHTS_CON_STRING` | API, Web (build) | Application Insights connection string |


## Updating data

To synchronize product data between SharePoint and Azure:

1. Open the LCM web application.
2. Click the **"Synchronize with SharePoint"** button.
3. This triggers the Logic App, which copies data from SharePoint to Azure Storage.
4. The API rebuilds the `products` table from the new blob data.

### Adding a new product

1. Go to [SharePoint](https://statoilsrm.sharepoint.com/sites/LCMlibrary) → **Documents**.
2. Open the folder for the supplier → open the **PSD** folder.
3. Click **"+ New"** to create a new LCM PSD Excel Sheet.
4. Go back to [SharePoint](https://statoilsrm.sharepoint.com/sites/LCMlibrary) → **Products summary**.
5. Click **"+ New"** and add metadata for the product.
   > **Important**: The product name must exactly match the Excel sheet filename.
6. Open the LCM web application and click **"Synchronize with SharePoint"**.

## Reauthorizing Logic App connections

If the Logic App returns "unauthorized" errors, the API connection tokens have likely expired. To fix:

1. Go to the `TransferDocsToBlob` resource in the Azure Portal.
2. Go to **API connections**.
3. Click on **`sharepointonline`** → **Edit API connection** → **Authorize**. Log in with Equinor credentials.
4. Click on **`azureblob`** → **Edit API connection** → **Authorize**. Paste the Azure Storage Account access key (found in `lcmdevstorage` → **Access keys**).
