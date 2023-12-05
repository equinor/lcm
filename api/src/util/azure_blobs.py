import io
from collections.abc import Iterator
from pathlib import Path

from azure.storage.blob import BlobProperties, ContainerClient
from xlrd.sheet import Sheet

from config import Config
from util.azure_table import process_meta_blob, sanitize_row_key
from util.excel import excel_raw_file_to_sheet, sheet_to_bridge_dict


def get_container_client() -> ContainerClient:
    return ContainerClient(
        account_url=f"{Config.TABLE_ACCOUNT_NAME}.blob.core.windows.net",
        credential=Config.TABLE_KEY,
        container_name=Config.BLOB_CONTAINER_NAME,
    )


def from_blobs_to_excel(blobs: Iterator[BlobProperties], container_client: ContainerClient) -> dict[str, Sheet]:
    sheets = {}
    for blob in blobs:
        if Path(blob.name).suffix != ".xlsx":
            continue
        blob_client = container_client.get_blob_client(blob)
        raw_blob = blob_client.download_blob().readall()
        product_id = sanitize_row_key(Path(blob.name).stem)
        sheets[product_id] = excel_raw_file_to_sheet(raw_blob)

    return sheets


def get_metadata_blob_data() -> list[dict]:
    blob_client = get_container_client().get_blob_client("metadata.csv")
    raw_blob = blob_client.download_blob().readall()
    f = io.StringIO(raw_blob.decode(encoding="utf-8"))
    return process_meta_blob(f)


def get_product_blobs_data() -> dict[str, dict]:
    container_client = get_container_client()
    all_blobs = container_client.list_blobs()
    sheets = from_blobs_to_excel(all_blobs, container_client)

    table_data = {}
    for filename, sheet in sheets.items():
        table_data[filename] = sheet_to_bridge_dict(sheet)

    return table_data
