from datetime import datetime, timedelta
from time import sleep

from azure.common import AzureConflictHttpError
from azure.cosmosdb.table.tableservice import TableService
from xlrd.sheet import Sheet

from util.excel import get_column_values


def _wait_for_table_to_be_created(table_service: TableService, table_name: str) -> bool:
    timer = datetime.now()
    is_created = False
    while not is_created:
        try:
            table_service.create_table(table_name, fail_on_exist=True)
            is_created = True
            print(f"Created table '{table_name}'")
        except AzureConflictHttpError as e:
            if datetime.now() - timer > timedelta(minutes=5):
                print(e)
                print(f"Could not crate {table_name} in 5 minutes")
                print("Giving up")
                print("Could not create Azure Table!")
                break
            print(f"Retrying in 5 seconds...")
            sleep(5)
    return is_created


def create_table(table_service: TableService, table_name: str):
    if table_service.exists(table_name):
        """
        When a table is successfully deleted,
        it is immediately marked for deletion and is no longer accessible to clients.
        The table is later removed from the Table service during garbage collection.
        Note that deleting a table is likely to take at least 40 seconds to complete.
        """
        table_service.delete_table(table_name)
        print(f"Deleted table '{table_name}'")
    _wait_for_table_to_be_created(table_service, table_name)


def sanitize_row_key(value: str) -> str:
    return value.replace("/", "-").replace("\\", "-").replace("#", "").replace("?", "-").replace(" ", "").lower()


def get_excel_entity(product_id: str, sheet: Sheet, column_name: str):
    column_values = get_column_values(sheet, column_name)
    return {
        "PartitionKey": column_name,
        "RowKey": sanitize_row_key(str(product_id)),
        "Value": str(column_values),
    }
