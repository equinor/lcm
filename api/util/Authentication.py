from azure.cosmosdb.table.tableservice import TableService

from config import Config


def getStorageSecret():
    return Config.azure_table_passwd


# This function establishes a connection to the Azure
# tables based on an input connection string.
def connectToTables():
    table_service = TableService(account_name=Config.TABEL_ACCOUNT_NAME, account_key=Config.TABEL_KEY)
    return table_service
