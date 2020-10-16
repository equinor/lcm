import os
import ast


class Config:
    TABEL_ACCOUNT_NAME = os.getenv("TABEL_ACCOUNT_NAME", "lcmdevstorage")
    TABEL_KEY = os.getenv("TABEL_KEY")
    BLOB_CONTAINER_NAME = "lcm-file-blobs"
    LOAD_TEST_DATA = ast.literal_eval(os.getenv("LOAD_TEST_DATA", "False"))
    SYNC_BLOBS_APP_URL = os.getenv(
        "SYNC_BLOBS_APP_URL",
        "https://prod-42.northeurope.logic.azure.com:443/workflows/9a6068e6cd3a463bab9b722a2f89ca98/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=X6L0pW_9CUGarHiYNVd6BeeiWRjZxM3DDtnCjvh5kRw",
    )
    AUTH_SECRET = os.getenv("AUTH_SECRET")
    AUTH_JWT_AUDIENCE = os.getenv("AUTH_JWT_AUDIENCE", "1dbc1e96-268d-41ad-894a-92a9fb85f954")
    # AUTH_JWT_AUDIENCE = os.getenv("AUTH_JWT_AUDIENCE", "a4f53185-961c-4ffa-96f9-41284348d0ec")
    AUTH_JWK_URL = os.getenv("AUTH_JWK_URL", "https://login.microsoftonline.com/common/discovery/v2.0/keys")
    ROUNDING_DECIMALS = 3
    DEFAULT_MAX_ITERATIONS = 100
