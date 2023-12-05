import unittest
from unittest import skip

from tests.utils import read_file
from util.azure_table import process_meta_blob
from util.excel import excel_raw_file_to_sheet, sheet_to_bridge_dict


@skip("No time to fix")
class CreateProductTableRow(unittest.TestCase):
    @staticmethod
    def test_create_row():
        with open("src/test_data/metadata.csv") as meta_file:
            productdata = process_meta_blob(meta_file)

        product_bridge_file = read_file("src/test_data/flow-carb10.xlsx")
        product_sheet = excel_raw_file_to_sheet(product_bridge_file)
        product_data = sheet_to_bridge_dict(product_sheet)

        productdata[0]["cumulative"] = product_data["cumulative"]
