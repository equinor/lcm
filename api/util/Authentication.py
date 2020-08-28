# This module can be called to perform authentication
# operations on the Azure key vault and the Azure tables

from azure.identity import ManagedIdentityCredential
from azure.keyvault.secrets import SecretClient
from azure.cosmosdb.table.tableservice import TableService

VAULT_URL = "https://teamblendkeys-test.vault.azure.net/"
STORAGE_SECRET_NAME = "pythontests-conn-string"


# This function uses Azure managed Identity to retrieve
# the connection string from a secret in the key vault.
# This function requires System Assigned identity to be
# enabled in the Azure function, as well as giving said
# function permission to get secrets from the key vault.
def getStorageSecret():
    credentials = ManagedIdentityCredential()

    secret_client = SecretClient(vault_url=VAULT_URL, credential=credentials)
    secret = secret_client.get_secret(STORAGE_SECRET_NAME)
    return secret.value


# This function establishes a connection to the Azure
# tables based on an input connection string.
def connectToTables(conn_string):
    table_service = TableService(connection_string=conn_string)
    return table_service
