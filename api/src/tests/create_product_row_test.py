import unittest

from tests.utils import read_file
from util.azure_table import process_meta_blob
from util.excel import excel_bytes_to_dataframe


class CreateProductTableRow(unittest.TestCase):
    @staticmethod
    def test_create_row():
        with open("src/test_data/metadata.csv") as meta_file:
            process_meta_blob(meta_file)

        product_bridge_file = read_file("src/test_data/flow-carb10.xlsx")
        product_df = excel_bytes_to_dataframe(product_bridge_file)
        product_df.Cumulative.to_list()
