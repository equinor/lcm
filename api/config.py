import os


class Config:
    azure_table_passwd = os.getenv("AZURE_TABLE_PASSWD", "maf")
    TABEL_CONNECTION_STRING = os.getenv("TABEL_CONNECTION_STRING")
    TABEL_ACCOUNT_NAME = os.getenv("TABEL_ACCOUNT_NAME", "lcmdevstorage")
    TABEL_KEY = os.getenv("TABEL_KEY")