import os
import ast


class Config:
    azure_table_passwd = os.getenv("AZURE_TABLE_PASSWD", "maf")
    TABEL_CONNECTION_STRING = os.getenv("TABEL_CONNECTION_STRING")
    TABEL_ACCOUNT_NAME = os.getenv("TABEL_ACCOUNT_NAME", "lcmdevstorage")
    TABEL_KEY = os.getenv("TABEL_KEY")
    BLOB_CONTAINER_NAME = "lcm-file-blobs"
    LOAD_TEST_DATA = ast.literal_eval(os.getenv("LOAD_TEST_DATA", "False"))
    SYNC_BLOBS_APP_URL = os.getenv(
        "SYNC_BLOBS_APP_URL",
        "https://prod-42.northeurope.logic.azure.com:443/workflows/9a6068e6cd3a463bab9b722a2f89ca98/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=X6L0pW_9CUGarHiYNVd6BeeiWRjZxM3DDtnCjvh5kRw",
    )
