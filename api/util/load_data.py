import csv
from time import sleep

import requests
from azure.cosmosdb.table.tableservice import TableBatch, TableService
from urllib3.exceptions import HeaderParsingError
from xlrd.sheet import Sheet

from config import Config
from util.azure_blobs import get_metadata_blob_data, get_product_blobs_data
from util.azure_table import create_table, get_excel_entity
from util.DatabaseOperations import (
    CUMULATIVE_TABLE_NAME,
    DISTRIBUTION_TABLE_NAME,
    METADATA_TABLE_NAME,
)
from util.excel import get_excel_files, read_excel_sheet

TEST_DATA_DIRECTORY = "./test_data"
METADATA_FILE_NAME = "metadata.csv"


def populate_metadata(table_service):
    batch = TableBatch()
    with open(f"{TEST_DATA_DIRECTORY}/{METADATA_FILE_NAME}") as meta_file:
        reader = csv.DictReader(meta_file)
        for product in reader:
            batch.insert_entity(
                {
                    **product,
                    "RowKey": product["title"],
                    "PartitionKey": METADATA_TABLE_NAME,
                }
            )
        table_service.commit_batch(table_name=METADATA_TABLE_NAME, batch=batch)


def populate_test_metadata(table_service):
    batch = TableBatch()
    with open(f"{TEST_DATA_DIRECTORY}/{METADATA_FILE_NAME}") as meta_file:
        reader = csv.DictReader(meta_file)
        for product in reader:
            batch.insert_entity(
                {
                    **product,
                    "RowKey": product["title"],
                    "PartitionKey": METADATA_TABLE_NAME,
                }
            )
        table_service.commit_batch(table_name=METADATA_TABLE_NAME, batch=batch)


def upload_metadata_file(table_service: TableService):
    create_table(table_service, METADATA_TABLE_NAME)
    populate_metadata(table_service)


def sync_sharepoint_and_az_blobs():
    request = requests.get(Config.SYNC_BLOBS_APP_URL)
    request.raise_for_status()
    print(f"Triggered Logic App by HTTP request for url; {Config.SYNC_BLOBS_APP_URL}")


def delete_all_entries_in_table(table_service, table_name):
    entities = table_service.query_entities(table_name)
    for t in entities:
        table_service.delete_entity(table_name, table_name, t.RowKey)
    print(f"Deleted all rows in '{table_name}' table")


def sync_excel_blobs_and_az_tables():
    table_service = TableService(account_name=Config.TABEL_ACCOUNT_NAME, account_key=Config.TABEL_KEY)
    for table in (METADATA_TABLE_NAME, CUMULATIVE_TABLE_NAME, DISTRIBUTION_TABLE_NAME):
        if not table_service.exists(table):
            create_table(table_service, table)
        # TODO: Consider insert_or_merge_entity() here instead https://docs.microsoft.com/en-us/python/api/azure-cosmosdb-table/azure.cosmosdb.table.tableservice.tableservice?view=azure-python
        delete_all_entries_in_table(table_service, table)

    distribution_batch = TableBatch()
    cumulative_batch = TableBatch()
    meta_batch = TableBatch()

    metadata = get_metadata_blob_data()
    for p in metadata:
        meta_batch.insert_entity(p)
    try:
        table_service.commit_batch(table_name=METADATA_TABLE_NAME, batch=meta_batch)
        print(
            f"Uploaded products metadata to '{METADATA_TABLE_NAME}' table in '{Config.TABEL_ACCOUNT_NAME}' storage account"
        )

        products_data = get_product_blobs_data()
        for product, values in products_data.items():
            distribution_batch.insert_entity(values["distribution"])
            cumulative_batch.insert_entity(values["cumulative"])

        table_service.commit_batch(table_name=DISTRIBUTION_TABLE_NAME, batch=distribution_batch)
        print(
            f"Uploaded products distribution data to '{DISTRIBUTION_TABLE_NAME}' table in '{Config.TABEL_ACCOUNT_NAME}' storage account"
        )
        table_service.commit_batch(table_name=CUMULATIVE_TABLE_NAME, batch=cumulative_batch)
        print(
            f"Uploaded cumulative data to '{CUMULATIVE_TABLE_NAME}' table in '{Config.TABEL_ACCOUNT_NAME}' storage account"
        )
    except HeaderParsingError as e:
        print(e)


def upload_test_excel_files(table_service: TableService):
    create_table(table_service, CUMULATIVE_TABLE_NAME)
    create_table(table_service, DISTRIBUTION_TABLE_NAME)
    distribution_batch = TableBatch()
    cumulative_batch = TableBatch()
    for file_path in get_excel_files(TEST_DATA_DIRECTORY):
        sheet: Sheet = read_excel_sheet(file_path)
        product_id: str = file_path.stem
        distribution_entity: dict = get_excel_entity(product_id=product_id, sheet=sheet, column_name="Distribution")
        distribution_batch.insert_entity(distribution_entity)
        cumulative_entity: dict = get_excel_entity(product_id=product_id, sheet=sheet, column_name="Cumulative")
        cumulative_batch.insert_entity(cumulative_entity)
    table_service.commit_batch(table_name=DISTRIBUTION_TABLE_NAME, batch=distribution_batch)
    table_service.commit_batch(table_name=CUMULATIVE_TABLE_NAME, batch=cumulative_batch)


def upload_data_to_azure_tables():
    if Config.LOAD_TEST_DATA:
        table_service = TableService(account_name=Config.TABEL_ACCOUNT_NAME, account_key=Config.TABEL_KEY)
        upload_metadata_file(table_service)
        upload_test_excel_files(table_service)


def sync_all():
    sync_sharepoint_and_az_blobs()
    # TODO: Use callBack from LogicApp to know when done/succeeded
    sleep(30)
    sync_excel_blobs_and_az_tables()


if __name__ == "__main__":
    # get_metadata_blob_data()
    sync_excel_blobs_and_az_tables()
    # upload_data_to_azure_tables()
