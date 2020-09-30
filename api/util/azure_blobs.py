from typing import List

import xlrd
from azure.storage.blob import BlobProperties, BlobServiceClient, ContainerClient
from xlrd.sheet import Sheet

from config import Config


def get_container_client() -> ContainerClient:
    return ContainerClient(
        account_url=f"{Config.TABEL_ACCOUNT_NAME}.blob.core.windows.net",
        credential=Config.TABEL_KEY,
        container_name=Config.BLOB_CONTAINER_NAME,
    )


def from_blobs_to_excel(
    blobs: List[BlobProperties], container_client: ContainerClient
) -> List[Sheet]:
    sheets = []
    for blob in blobs:
        blob_client = container_client.get_blob_client(blob)
        raw_blob = blob_client.download_blob().readall()

        Wb = xlrd.open_workbook(file_contents=raw_blob)

        sheet = Wb.sheet_by_index(0)

        print(123)

    return sheets


def get_azure_blobs():
    container_client = get_container_client()
    res = container_client.list_blobs()
    sheets = from_blobs_to_excel(res, container_client)
    return res


if __name__ == "__main__":
    get_azure_blobs()
