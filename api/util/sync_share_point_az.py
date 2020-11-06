from datetime import datetime
from time import sleep

import requests
from azure.common import AzureMissingResourceHttpError
from azure.cosmosdb.table.tableservice import TableBatch, TableService
from urllib3.exceptions import HeaderParsingError

from config import Config
from util.azure_blobs import get_metadata_blob_data, get_product_blobs_data
from util.azure_table import create_table


def sync_sharepoint_and_az_blobs():
    request = requests.get(Config.SYNC_BLOBS_APP_URL)
    request.raise_for_status()
    print(f"Triggered Logic App by HTTP request for url; {Config.SYNC_BLOBS_APP_URL}")


def delete_all_entries_in_table(table_service, table_name):
    entities = []
    try:
        entities = table_service.query_entities(table_name)
    except AzureMissingResourceHttpError:
        pass
    for t in entities:
        table_service.delete_entity(table_name, table_name, t.RowKey)
    print(f"Deleted all rows in '{table_name}' table")


def sync_excel_blobs_and_az_tables():
    table_service = TableService(account_name=Config.TABLE_ACCOUNT_NAME, account_key=Config.TABLE_KEY)
    if not table_service.exists(Config.PRODUCT_TABLE_NAME):
        create_table(table_service, Config.PRODUCT_TABLE_NAME)
    # TODO: Consider insert_or_merge_entity() here instead https://docs.microsoft.com/en-us/python/api/azure-cosmosdb-table/azure.cosmosdb.table.tableservice.tableservice?view=azure-python
    delete_all_entries_in_table(table_service, Config.PRODUCT_TABLE_NAME)
    batch = TableBatch()

    table_data = get_metadata_blob_data()
    products_data = get_product_blobs_data()
    for p in table_data:
        try:
            p["cumulative"] = str(products_data[p["id"]]["cumulative"])
        except KeyError:
            p["cumulative"] = None
        batch.insert_entity(p)
    try:
        table_service.commit_batch(table_name=Config.PRODUCT_TABLE_NAME, batch=batch)
        print(
            f"Uploaded products data to '{Config.PRODUCT_TABLE_NAME}' table in '{Config.TABLE_ACCOUNT_NAME}' storage account"
        )

    except HeaderParsingError as e:
        print(e)


def sync_all():
    start = datetime.now()
    sync_sharepoint_and_az_blobs()
    # TODO: Use callBack from LogicApp to know when done/succeeded
    sleep(30)
    sync_excel_blobs_and_az_tables()
    end = datetime.now() - start
    print(f"The sync took {end}")
