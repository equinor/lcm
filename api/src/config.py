import ast
import os
from pathlib import Path


class Config:
    TABLE_ACCOUNT_NAME = os.getenv("TABLE_ACCOUNT_NAME", "lcmdevstorage")
    TABLE_KEY = os.getenv("TABLE_KEY")
    APPINSIGHTS_CON_STRING = os.getenv("APPINSIGHTS_CON_STRING")
    BLOB_CONTAINER_NAME = "lcm-file-blobs"
    LOAD_TEST_DATA = ast.literal_eval(os.getenv("LOAD_TEST_DATA", "False"))
    SYNC_BLOBS_APP_URL = os.getenv("SYNC_BLOBS_APP_URL")
    AUTH_SECRET = os.getenv("AUTH_SECRET")
    AUTH_JWT_AUDIENCE = os.getenv("AUTH_JWT_AUDIENCE", "api://lost-circulation-material-api")
    AUTH_JWT_ISSUER = os.getenv(
        "AUTH_JWT_ISSUER"
    )  # Tenant-specific issuer, e.g. https://login.microsoftonline.com/<tenant-id>/v2.0
    AUTH_JWK_URL = os.getenv("AUTH_JWK_URL", "https://login.microsoftonline.com/common/discovery/v2.0/keys")
    ROUNDING_DECIMALS = 3
    DEFAULT_MAX_ITERATIONS = 100
    HOME_DIR = str(Path(__file__).parent.absolute())
    PRODUCT_TABLE_NAME = "products"
    NAMED_SUPPLIERS: tuple[str, ...] = ("Baker Hughes", "Halliburton", "Schlumberger")
