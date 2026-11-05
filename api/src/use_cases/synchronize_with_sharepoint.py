import logging
from datetime import datetime
from time import sleep

import requests
from azure.cosmosdb.table.tableservice import TableBatch, TableService

from config import config
from util.azure_blobs import get_metadata_blob_data, get_product_blobs_data
from util.exceptions import InternalErrorException

_logger = logging.getLogger("API")


def sync_sharepoint_and_az_blobs():
    if not config.SYNC_BLOBS_APP_URL:
        raise InternalErrorException("SYNC_BLOBS_APP_URL is not configured")
    request = requests.get(config.SYNC_BLOBS_APP_URL, timeout=30)
    request.raise_for_status()
    _logger.info("Triggered Logic App sync")


def sync_excel_blobs_and_az_tables():
    table_data = get_metadata_blob_data()
    if not table_data:
        raise InternalErrorException("Synchronization aborted: product metadata is empty")

    products_data = get_product_blobs_data()
    row_keys = set()
    for p in table_data:
        if p["PartitionKey"] != config.PRODUCT_TABLE_NAME or p["RowKey"] in row_keys:
            raise InternalErrorException("Synchronization aborted: invalid or duplicate product keys")
        row_keys.add(p["RowKey"])
        try:
            p["cumulative"] = str(products_data[p["id"]]["cumulative"])
        except KeyError:
            p["cumulative"] = None

    table_service = TableService(account_name=config.TABLE_ACCOUNT_NAME, account_key=config.TABLE_KEY)
    table_exists = table_service.exists(config.PRODUCT_TABLE_NAME)
    existing = list(table_service.query_entities(config.PRODUCT_TABLE_NAME)) if table_exists else []
    if any(entity.PartitionKey != config.PRODUCT_TABLE_NAME for entity in existing):
        raise InternalErrorException("Synchronization aborted: unexpected product partition")
    obsolete = [entity for entity in existing if entity.RowKey not in row_keys]
    # One partition and at most 100 operations keep the replacement atomic.
    if len(table_data) + len(obsolete) > 100:
        raise InternalErrorException("Synchronization aborted: replacement exceeds the 100-operation transaction limit")

    batch = TableBatch()
    for product in table_data:
        batch.insert_or_replace_entity(product)
    for entity in obsolete:
        batch.delete_entity(entity.PartitionKey, entity.RowKey)

    if not table_exists:
        table_service.create_table(config.PRODUCT_TABLE_NAME)
    table_service.commit_batch(table_name=config.PRODUCT_TABLE_NAME, batch=batch)
    _logger.info(
        f"Uploaded products data to '{config.PRODUCT_TABLE_NAME}' table in '{config.TABLE_ACCOUNT_NAME}' storage account"
    )


def synchronize_with_sharepoint():
    start = datetime.now()
    sync_sharepoint_and_az_blobs()
    # TODO: Use callBack from LogicApp to know when done/succeeded
    sleep(50)
    sync_excel_blobs_and_az_tables()
    end = datetime.now() - start
    _logger.info(f"The sync completed in {end.total_seconds()} seconds")
    return "ok"
