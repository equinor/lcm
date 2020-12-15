import ast
import os
from pathlib import Path


class Config:
    TABLE_ACCOUNT_NAME = os.getenv("TABLE_ACCOUNT_NAME", "lcmdevstorage")
    TABLE_KEY = os.getenv("TABLE_KEY")
    BLOB_CONTAINER_NAME = "lcm-file-blobs"
    LOAD_TEST_DATA = ast.literal_eval(os.getenv("LOAD_TEST_DATA", "False"))
    SYNC_BLOBS_APP_URL = os.getenv(
        "SYNC_BLOBS_APP_URL",
        "https://prod-42.northeurope.logic.azure.com:443/workflows/9a6068e6cd3a463bab9b722a2f89ca98/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=X6L0pW_9CUGarHiYNVd6BeeiWRjZxM3DDtnCjvh5kRw",
    )
    AUTH_SECRET = os.getenv("AUTH_SECRET")
    AUTH_JWT_AUDIENCE = os.getenv("AUTH_JWT_AUDIENCE", "api://lost-circulation-material-api")
    AUTH_JWK_URL = os.getenv("AUTH_JWK_URL", "https://login.microsoftonline.com/common/discovery/v2.0/keys")
    ROUNDING_DECIMALS = 3
    DEFAULT_MAX_ITERATIONS = 100
    HOME_DIR = str(Path(__file__).parent.absolute())
    PRODUCT_TABLE_NAME = "products"
    named_supplier = ("Baker Hughes", "Halliburton", "Schlumberger")
