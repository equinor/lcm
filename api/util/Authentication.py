from azure.cosmosdb.table.tableservice import TableService

from config import Config


def getStorageSecret():
    return Config.azure_table_passwd


# This function establishes a connection to the Azure
# tables based on an input connection string.
def connectToTables(conn_string):
    table_service = TableService(connection_string=conn_string)
    return table_service
