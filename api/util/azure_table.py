import csv
import json
from datetime import datetime, timedelta
from time import sleep
from typing import io, List

from azure.common import AzureConflictHttpError
from azure.cosmosdb.table.tableservice import TableService

from config import Config


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


def get_service():
    return TableService(account_name=Config.TABLE_ACCOUNT_NAME, account_key=Config.TABLE_KEY)


def process_meta_blob(meta_file: io.TextIO) -> List[dict]:
    reader = csv.DictReader(meta_file)

    products = []
    for row in reader:
        products.append(
            {
                "PartitionKey": Config.PRODUCT_TABLE_NAME,
                "RowKey": sanitize_row_key(row["title"]),
                "id": sanitize_row_key(row["title"]),
                **row,
                "supplier": row["supplier"] if row["supplier"] in Config.named_supplier else "Other",
                # TODO: Prod data is missing co2 impact
                "co2": row["co2"] if row["co2"] else 1000,
                # TODO: Prod data is missing cost
                "cost": row["cost"] if row["cost"] else 100,
                # TODO: Prod data is missing Sack_size
                "sack_size": row["sack_size"] if row["sack_size"] else 25,
                # TODO: Why is 'environmental' read so strange from SharePoint?
                "environmental": json.loads(row["environmental"])["Value"].upper()
                if row["environmental"]
                else "Green",
            }
        )
    return products
