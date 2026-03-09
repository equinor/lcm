import os
from pathlib import Path


class Config:
    TABLE_ACCOUNT_NAME = os.getenv("TABLE_ACCOUNT_NAME", "lcmdevstorage")
    TABLE_KEY = os.getenv("TABLE_KEY")
    APPINSIGHTS_CON_STRING = os.getenv("APPINSIGHTS_CON_STRING")
    BLOB_CONTAINER_NAME = "lcm-file-blobs"
    SYNC_BLOBS_APP_URL = os.getenv("SYNC_BLOBS_APP_URL")
    AUTH_SECRET = os.getenv("AUTH_SECRET")
    AUTH_JWT_AUDIENCES = os.getenv(
        "AUTH_JWT_AUDIENCES", "api://lost-circulation-material-api,1dbc1e96-268d-41ad-894a-92a9fb85f954"
    ).split(",")
    AUTH_JWT_ISSUER = os.getenv("AUTH_JWT_ISSUER")
    AUTH_OIDC_WELL_KNOWN = os.getenv(
        "AUTH_OIDC_WELL_KNOWN",
        "https://login.microsoftonline.com/3aa4a235-b6e2-48d5-9195-7fcf05b459b0/v2.0/.well-known/openid-configuration",
    )
    HOME_DIR = str(Path(__file__).parent.absolute())
    PRODUCT_TABLE_NAME = "products"
    NAMED_SUPPLIERS: tuple[str, ...] = ("Baker Hughes", "Halliburton", "Schlumberger")
