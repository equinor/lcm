import csv

from azure.cosmosdb.table.tableservice import TableBatch, TableService
from config import Config
from util.DatabaseOperations import CUMULATIVE_TABLE_NAME, DISTRIBUTION_TABLE_NAME, METADATA_TABLE_NAME
from xlrd.sheet import Sheet

from util.azure_table import create_table
from util.excel import get_excel_files, read_excel_sheet, get_column_values

TEST_DATA_DIRECTORY = "./test_data"
METADATA_FILE_NAME = "metadata.csv"


def populate_metadata(table_service):
    batch = TableBatch()
    with open(f"{TEST_DATA_DIRECTORY}/{METADATA_FILE_NAME}") as meta_file:
        reader = csv.DictReader(meta_file)
        for product in reader:
            batch.insert_entity({
                **product,
                "RowKey": product["title"],
                "PartitionKey": METADATA_TABLE_NAME,
            })
        table_service.commit_batch(table_name=METADATA_TABLE_NAME, batch=batch)


def upload_metadata_file(table_service: TableService):
    create_table(table_service, METADATA_TABLE_NAME)
    populate_metadata(table_service)


def get_excel_entity(product_id: str, sheet: Sheet, column_name: str):
    column_values = get_column_values(sheet, column_name)
    return {
        "PartitionKey": column_name,
        "RowKey": str(product_id),
        "Value": str(column_values),
    }


def upload_excel_files(table_service: TableService):
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
        upload_excel_files(table_service)


if __name__ == '__main__':
    upload_data_to_azure_tables()
