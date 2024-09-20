import io
from collections.abc import Iterator
from pathlib import Path

from azure.storage.blob import BlobProperties, ContainerClient
from pandas import DataFrame, read_excel

from config import Config
from util.azure_table import process_meta_blob, sanitize_row_key


def get_container_client() -> ContainerClient:
    return ContainerClient(
        account_url=f"{Config.TABLE_ACCOUNT_NAME}.blob.core.windows.net",
        credential=Config.TABLE_KEY,
        container_name=Config.BLOB_CONTAINER_NAME,
    )


def excel_bytes_to_dataframe(file: bytes) -> DataFrame:
    file_io = io.BytesIO(file)
    df = read_excel(file_io)
    return df


def from_excel_blobs_to_data_frame(
    blobs: Iterator[BlobProperties], container_client: ContainerClient
) -> dict[str, DataFrame]:
    products: dict[str, DataFrame] = {}
    for blob in blobs:
        if Path(blob.name).suffix != ".xlsx":
            continue
        blob_client = container_client.get_blob_client(blob)
        raw_blob = blob_client.download_blob().readall()
        product_id = sanitize_row_key(Path(blob.name).stem)
        products[product_id] = excel_bytes_to_dataframe(raw_blob)

    return products


def get_metadata_blob_data() -> list[dict]:
    blob_client = get_container_client().get_blob_client("metadata.csv")
    raw_blob = blob_client.download_blob().readall()
    f = io.StringIO(raw_blob.decode(encoding="utf-8"))
    return process_meta_blob(f)


def get_product_blobs_data() -> dict[str, dict]:
    container_client = get_container_client()
    all_blobs = container_client.list_blobs()
    dfs = from_excel_blobs_to_data_frame(all_blobs, container_client)
    return {filename: {"cumulative": data_frame.Cumulative.to_list()} for filename, data_frame in dfs.items()}
