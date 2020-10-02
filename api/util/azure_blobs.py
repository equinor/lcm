import csv
import io
import json
from pathlib import Path
from typing import Dict, Iterator, List

import xlrd
from azure.storage.blob import BlobProperties, ContainerClient
from xlrd.sheet import Sheet

from config import Config
from util.azure_table import get_excel_entity, sanitize_row_key


def get_container_client() -> ContainerClient:
    return ContainerClient(
        account_url=f"{Config.TABEL_ACCOUNT_NAME}.blob.core.windows.net",
        credential=Config.TABEL_KEY,
        container_name=Config.BLOB_CONTAINER_NAME,
    )


def from_blobs_to_excel(blobs: Iterator[BlobProperties], container_client: ContainerClient) -> Dict[str, Sheet]:
    sheets = {}
    for blob in blobs:
        if Path(blob.name).suffix != ".xlsx":
            continue

        blob_client = container_client.get_blob_client(blob)
        raw_blob = blob_client.download_blob().readall()
        workbook = xlrd.open_workbook(file_contents=raw_blob)
        sheets[Path(blob.name).stem] = workbook.sheet_by_index(0)

    return sheets


def get_metadata_blob_data() -> List[Dict]:
    blob_client = get_container_client().get_blob_client("metadata.csv")
    raw_blob = blob_client.download_blob().readall()
    f = io.StringIO(raw_blob.decode(encoding="utf-8"))
    reader = csv.DictReader(f)

    products = []
    for row in reader:
        # TODO: Why is 'environmental' read so strange from SharePoint?
        environment = json.loads(row["environmental"])["Value"].upper()
        products.append(
            {
                "PartitionKey": "Metadata",
                "RowKey": sanitize_row_key(row["title"]),
                **row,
                "environmental": environment,
            }
        )

    return products


def get_product_blobs_data() -> Dict[str, Dict]:
    tabel_data = {}
    container_client = get_container_client()

    all_blobs = container_client.list_blobs()
    sheets = from_blobs_to_excel(all_blobs, container_client)
    for filename, sheet in sheets.items():
        tabel_data[filename] = {}
        tabel_data[filename]["cumulative"] = get_excel_entity(filename, sheet, "Cumulative")
        tabel_data[filename]["distribution"] = get_excel_entity(filename, sheet, "Distribution")

    return tabel_data


if __name__ == "__main__":
    get_product_blobs_data()
