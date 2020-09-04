# This function is not intended to be invoked directly. Instead it will be
# triggered by an orchestrator function.
# This function Transfers data from a blob container in azure storage,
# as defined by CONTAINER_NAME, by using a connection string collected
# via Azure Managed Identities. The data collected is transferred
# to tables, as specified by METADATA_TABLE_NAME, CUMULATIVE_TABLE_NAME,
# and DISTRIBUTION_TABLE_NAME.
import csv
from datetime import datetime, timedelta
from pathlib import Path
from time import sleep

import requests
import xlrd
from azure.common import AzureConflictHttpError
from azure.cosmosdb.table.tableservice import TableBatch, TableService

from config import Config

METADATA_FILE_NAME = "Metadata.txt"  # Name of file to read metadata from.
CONTAINER_NAME = "pythoncontainer"  # Name of container in blob storage to read from.
METADATA_TABLE_NAME = "Metadata"  # Name of table to write metadata to.
CUMULATIVE_TABLE_NAME = (
    "Cumulative"  # Name of table to write cumulative distribution to.
)
DISTRIBUTION_TABLE_NAME = "Distribution"  # Name of table to write distribution to.


# TODO: Parameterize key vault name


def get_excel_file_list(dir):
    path = Path(dir)
    return [x for x in path.rglob("*") if x.is_file() and x.suffix == ".xlsx"]


def create_table():
    table_service = TableService(account_name=Config.TABEL_ACCOUNT_NAME, account_key=Config.TABEL_KEY)
    timer = datetime.now()

    def create_recursive():
        try:
            table_service.create_table(METADATA_TABLE_NAME, fail_on_exist=True)
        except AzureConflictHttpError as e:
            print(e)
            if datetime.now() - timer > timedelta(minutes=2):
                print("Could not crate table in 2 minutes")
                print("Giving up")
                raise Exception("Could not create Azure Table!")
            print(f"Retrying in 10 seconds...")
            sleep(10)
            create_recursive()

    create_recursive()


def write_meta_data_to_tables():
    table_service = TableService(account_name=Config.TABEL_ACCOUNT_NAME, account_key=Config.TABEL_KEY)
    table_batch = TableBatch()

    # Always create a fresh table
    table_service.delete_table(METADATA_TABLE_NAME)
    create_table()

    with open("../test_data/metadata.csv") as meta_file:
        reader = csv.DictReader(meta_file)
        for product in reader:
            entity = {**product, "PartitionKey": METADATA_TABLE_NAME, "RowKey": product["title"]}
            table_batch.insert_entity(entity)

    table_service.commit_batch(METADATA_TABLE_NAME, table_batch)


# TODO: Not done
def write_products_excel_to_tabel():
    table_service = TableService(account_name=Config.TABEL_ACCOUNT_NAME, account_key=Config.TABEL_KEY)

    for file in get_excel_file_list("../test_data"):
        sheet = readExcelSheet(file)


# Reads an excel sheet from azure blob storage,
# by opening it as a buffered file.
def readExcelSheet(file):
    absolute_path = str(file.absolute())
    Wb = xlrd.open_workbook(absolute_path)

    sheet = Wb.sheet_by_index(0)
    return sheet


# Sends an http post request to the callback url supplied
# by the webhook in Azure functions
def sendWebhookResponse(callback_url, status):
    params = {"status": status}

    requests.post(url=callback_url, params=params)


def writeSizeStepsToTables(sheet, batch):
    size_step_index = -1

    for i in range(sheet.ncols):
        if sheet.cell_value(0, i) == "Size, micron":
            size_step_index = i

    size_steps_list = []

    for i in range(1, sheet.nrows):

        if size_step_index != -1:
            size_steps_list.append(sheet.cell_value(i, size_step_index))

    if size_steps_list:
        element = {
            "PartitionKey": "Metadata",
            "RowKey": "Size_steps",
            "Size_steps": str(size_steps_list),
        }

        batch.insert_or_replace_entity(element)

    return batch


def deleteAllDataFromTables(table_service):
    tables = table_service.list_tables()

    for table in tables:
        delete_batch = TableBatch()

        entities = table_service.query_entities(table_name=table.name)

        for entity in entities:
            delete_batch.delete_entity(
                partition_key=entity["PartitionKey"], row_key=entity["RowKey"]
            )

        table_service.commit_batch(table_name=table.name, batch=delete_batch)


if __name__ == '__main__':
    write_meta_data_to_tables()
