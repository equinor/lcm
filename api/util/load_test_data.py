# This function is not intended to be invoked directly. Instead it will be
# triggered by an orchestrator function.
# This function Transfers data from a blob container in azure storage,
# as defined by CONTAINER_NAME, by using a connection string collected
# via Azure Managed Identities. The data collected is transferred
# to tables, as specified by METADATA_TABLE_NAME, CUMULATIVE_TABLE_NAME,
# and DISTRIBUTION_TABLE_NAME.
import csv
from pathlib import Path

import requests
import xlrd
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


def moveDataFromBlobToTable():
    # table_service, container, blob_list = connectToAzure(conn_string, CONTAINER_NAME)
    table_service = TableService(account_name=Config.TABEL_ACCOUNT_NAME, account_key=Config.TABEL_KEY)

    createAllTables(table_service)

    deleteAllDataFromTables(table_service)

    distribution_batch = TableBatch()
    cumulative_batch = TableBatch()
    metadata_batch = TableBatch()

    products_metadata_dict, categories = createMetaDataDict()

    id_dict, metadata_batch, add_size_steps = writeMetaDataToAzureTables(
        table_service, METADATA_TABLE_NAME, products_metadata_dict, metadata_batch
    )
    for file in get_excel_file_list("../test_data"):
        sheet = readExcelSheet(file)

        if add_size_steps:
            metadata_batch = writeSizeStepsToTables(sheet, metadata_batch)
            add_size_steps = False

        distribution_batch = writeDistributionToAzureTables(
            sheet,
            id_dict,
            file.stem,
            distribution_batch,
        )

        cumulative_batch = writeCumulativeToAzureTables(
            sheet,
            table_service,
            id_dict,
            file.stem,
            CUMULATIVE_TABLE_NAME,
            cumulative_batch,
        )

    # for blob in blob_list:
    #     if len(blob.name.split(".")) == 1:
    #         container.delete_blob(blob, delete_snapshots="include")
    #         continue
    #     elif blob.name.split(".")[1] == "xlsx":
    #
    #         sheet = readExcelSheet(conn_string, CONTAINER_NAME, blob.name, 0)
    #
    #         if add_size_steps:
    #             metadata_batch = writeSizeStepsToTables(sheet, metadata_batch)
    #             add_size_steps = False
    #
    #         distribution_batch = writeDistributionToAzureTables(
    #             sheet,
    #             table_service,
    #             id_dict,
    #             blob.name.split(".")[0],
    #             DISTRIBUTION_TABLE_NAME,
    #             distribution_batch,
    #         )
    #
    #         cumulative_batch = writeCumulativeToAzureTables(
    #             sheet,
    #             table_service,
    #             id_dict,
    #             blob.name.split(".")[0],
    #             CUMULATIVE_TABLE_NAME,
    #             cumulative_batch,
    #         )
    #
    #     container.delete_blob(blob, delete_snapshots="include")

    table_service.commit_batch(
        table_name=DISTRIBUTION_TABLE_NAME, batch=distribution_batch
    )
    table_service.commit_batch(table_name=CUMULATIVE_TABLE_NAME, batch=cumulative_batch)
    table_service.commit_batch(table_name=METADATA_TABLE_NAME, batch=metadata_batch)

    return "succeeded"


# Creates tables for metadata, PSD and cumulative distribution.
def createAllTables(table_service):
    if not table_service.exists(METADATA_TABLE_NAME, timeout=None):
        table_service.create_table(METADATA_TABLE_NAME)

    if not table_service.exists(CUMULATIVE_TABLE_NAME, timeout=None):
        table_service.create_table(CUMULATIVE_TABLE_NAME)

    if not table_service.exists(DISTRIBUTION_TABLE_NAME, timeout=None):
        table_service.create_table(DISTRIBUTION_TABLE_NAME)


# Creates a dictionary containing metadata mapped to product name.
def createMetaDataDict():
    products_metadata_dict = {}
    with open("../test_data/metadata.csv") as meta_file:
        reader = csv.DictReader(meta_file, )
        for line in reader:
            product_meta = {}
            product_meta["TITLE"] = line["title"]
            product_meta["SUPPLIER"] = line["supplier"]
            products_metadata_dict[line["title"]] = product_meta

        categories = reader.fieldnames

        # for i in range(len(categories)):
        #     categories[i] = categories[i].upper()
        #
        # lines = removeShortLines(lines, len(categories))
        #
        # products_metadata_dict = {}
        #
        # for i in range(1, len(lines)):
        #     metadata = lines[i].split(",")
        #
        #     product_name = extractProductNameFromMetadata(metadata, categories)
        #     supplier = extractSupplierNameFromMetadata(metadata, categories)
        #
        #     metadata_dict = {}
        #
        #     for j in range(len(categories)):
        #         if " " in categories[j]:
        #             categories[j] = categories[j].replace(" ", "_")
        #         metadata_dict[categories[j]] = metadata[j]
        #
        #     metadata_dict["TITLE"] = product_name
        #     metadata_dict["SUPPLIER"] = supplier
        #
        #     products_metadata_dict[product_name] = metadata_dict

        return products_metadata_dict, categories


# Removes excessive lines, i.e lines with length shorter than length.
# This is a helper function to remove empty lines from collected
# metadata
def removeShortLines(lines, length):
    newlines = []

    for line in lines:
        if len(line) >= length:
            newlines.append(line)

    return newlines


# Writes metadata to the corresponding azure table.
def writeMetaDataToAzureTables(
        table_service, table_name, products_metadata_dict, batch
):
    add_size_steps = True

    id_dict = {}

    highest_id = 0

    names = table_service.query_entities(table_name)

    for name in names:
        if name["RowKey"] == "Size_steps":
            add_size_steps = False
        else:
            id_dict[name["TITLE"]] = name["RowKey"]
            if int(name["RowKey"]) > highest_id:
                highest_id = int(name["RowKey"])

    for product_name in products_metadata_dict:
        metadata = products_metadata_dict[product_name]
        if metadata["TITLE"] not in id_dict:
            id_dict[metadata["TITLE"]] = str(highest_id + 1)
            highest_id += 1

        table_element = {
            "PartitionKey": METADATA_TABLE_NAME,
            "RowKey": str(id_dict[metadata["TITLE"]]),
        }

        for category in metadata:
            table_element[category] = metadata[category]

        batch.insert_or_replace_entity(table_element)

    return id_dict, batch, add_size_steps


# Reads an excel sheet from azure blob storage,
# by opening it as a buffered file.
def readExcelSheet(file):
    absolute_path = str(file.absolute())
    Wb = xlrd.open_workbook(absolute_path)

    sheet = Wb.sheet_by_index(0)
    return sheet


# Writes the distribution of a product from an open
# excel sheet to the corresponding azure table.
def writeDistributionToAzureTables(sheet, id_dict, file_name, batch):
    id = id_dict[file_name]

    distribution_index = -1

    for i in range(sheet.ncols):
        if sheet.cell_value(0, i) == "Distribution":
            distribution_index = i

    distribution_list = []

    for i in range(1, sheet.nrows):

        if distribution_index != -1:
            distribution_list.append(sheet.cell_value(i, distribution_index))

    if distribution_list:
        element = {
            "PartitionKey": "Distribution",
            "RowKey": str(id),
            "Value": str(distribution_list),
        }

        batch.insert_or_replace_entity(element)

    return batch


# Writes the cumulative distribution of a product from an open
# excel sheet to the corresponding azure table.
def writeCumulativeToAzureTables(
        sheet, table_service, id_dict, file_name, table_name, batch
):
    id = id_dict[file_name]

    cumulative_index = -1

    for i in range(sheet.ncols):
        if sheet.cell_value(0, i) == "Cumulative":
            cumulative_index = i

    cumulative_list = []

    for i in range(1, sheet.nrows):

        if cumulative_index != -1:
            cumulative_list.append(sheet.cell_value(i, cumulative_index))

    if cumulative_list:
        element = {
            "PartitionKey": "Cumulative",
            "RowKey": str(id),
            "Value": str(cumulative_list),
        }

        batch.insert_or_replace_entity(element)

    return batch


# Extracts a products name from metadata, based on "Title"'s
# position in 'categories'.
# def extractProductNameFromMetadata(metadata, categories):
#     if "TITLE" in categories:
#         title_index = categories.index("TITLE")
#     else:
#         title_index = 5
#
#     product_name = metadata[title_index].split(" #")
#     product_name_str = ""
#
#     for i in range(len(product_name)):
#         product_name_str += product_name[i]
#
#     return product_name_str
#
#
# # Extracts a products supplier name from metadata, based on
# # "Supplier"'s position in 'categories'.
# def extractSupplierNameFromMetadata(metadata, categories):
#     if "SUPPLIER" in categories:
#         supplier_index = categories.index("SUPPLIER")
#     else:
#         supplier_index = 4
#
#     supplier = metadata[supplier_index].split(" #")
#     supplier_str = ""
#
#     for i in range(len(supplier)):
#         supplier_str += supplier[i]
#
#     return supplier_str


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
    moveDataFromBlobToTable()
