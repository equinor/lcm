import os


class Config:
    azure_table_passwd = os.getenv("AZURE_TABLE_PASSWD", "maf")