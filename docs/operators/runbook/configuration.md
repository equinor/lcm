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
| `sharepointonline` | Access to the SharePoint site | Equinor account with read access to the product list and document folders (function user `f_lcm_blend@statoil.net`) |
| `azureblob-2` | Upload metadata and PSD files to Storage | Storage Account access key for `lcmdevstorage` |

> **Troubleshooting**: See [Troubleshooting Logic App synchronization](#troubleshooting-logic-app-synchronization)
> for permissions, connection credentials, upload conflicts, and verification.

### SharePoint
The SharePoint site is the main data provider for the application. Product metadata and product Particle Size Distribution (PSD) data is stored and updated here.

- **Site**: `https://statoilsrm.sharepoint.com/sites/LCMlibrary`
- **Purpose**: Primary data source for product information

> **Important**: For the link between product metadata and PSD data to work, the product name in the SharePoint "Product" list must exactly match the corresponding `.xlsx` filename.


### Secrets (Radix)

Secrets are stored as Radix secrets and set per environment in the Radix web console. See [Deployment](deployment.md#secrets) for the full list.

The local API (`.env`), the deployed API (Radix secrets), and the Logic App connection (`azureblob-2`) hold credentials separately.
Updating one does not update the others. Never commit access keys or signed trigger URLs, or include them in shared logs.

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

### SharePoint connection and permissions

1. Open `TransferDocsToBlob` in the Azure Portal, then **API connections**.
2. Select `sharepointonline` → **Edit API connection** → **Authorize**.
3. Sign in with your Equinor credentials (make sure you have access to the Sharepoint folder). To check access,
open the exact site, list, and folder from the action's inputs in a browser signed in as that account.
If access is denied, request it from the site owner, explaining that it is needed for LCM application synchronization.

### Azure Blob connection access key

1. Open **Storage accounts → lcmdevstorage → Security + networking → Access keys**.
2. Copy one existing **Key** value (`key1` or `key2`), not the connection string.
3. Open **Resource group lcm-dev → azureblob-2 → Edit API connection**, or navigate
   there through the Logic App's **API connections**.
4. Set **Authentication Type** to **Access Key**, the account name to
   `lcmdevstorage`, and paste the key into **Azure Storage Account Access Key**.
5. Save, and confirm both upload actions use this connection.
