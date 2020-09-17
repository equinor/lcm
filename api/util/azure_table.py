from azure.common import AzureConflictHttpError
from datetime import datetime, timedelta
from azure.cosmosdb.table.tableservice import TableService
from time import sleep


def _wait_for_table_to_be_created(table_service: TableService, table_name: str) -> bool:
    timer = datetime.now()
    is_created = False
    while not is_created:
        try:
            table_service.create_table(table_name, fail_on_exist=True)
            is_created = True
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
    _wait_for_table_to_be_created(table_service, table_name)
