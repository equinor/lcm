import unittest

from util.azure_blobs import excel_bytes_to_dataframe
from util.azure_table import process_meta_blob


class CreateProductTableRow(unittest.TestCase):
    @staticmethod
    def test_create_row():
        with open("src/test_data/metadata.csv") as meta_file:
            process_meta_blob(meta_file)

        with open("src/test_data/flow-carb10.xlsx", "rb") as file:
            product_bridge_file = file.read()

        product_df = excel_bytes_to_dataframe(product_bridge_file)
        product_df.Cumulative.to_list()
