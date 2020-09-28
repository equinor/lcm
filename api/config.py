import os
import ast


class Config:
    azure_table_passwd = os.getenv("AZURE_TABLE_PASSWD", "maf")
    TABEL_ACCOUNT_NAME = os.getenv("TABEL_ACCOUNT_NAME", "lcmdevstorage")
    TABEL_KEY = os.getenv("TABEL_KEY")
    LOAD_TEST_DATA = ast.literal_eval(os.getenv("LOAD_TEST_DATA", "False"))
