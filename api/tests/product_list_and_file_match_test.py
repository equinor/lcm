import unittest

from azure.common import AzureMissingResourceHttpError

from controllers.products import products_get
from util.DatabaseOperations import getCumulative

known_missing_excel_files = [
    ("flow-carb10", "Baker Hughes"),
    ("mil-carb1000", "Baker Hughes"),
    ("mil-plugfine", "Baker Hughes"),
    ("mil-plugmedium", "Baker Hughes"),
    ("milmicaf", "Baker Hughes"),
    ("milmicam", "Baker Hughes"),
    ("soluflakec", "Baker Hughes"),
    ("baracarb1200", "Halliburton"),
    ("barolifte", "Halliburton"),
    ("steelseal1000", "Halliburton"),
    ("stoppit", "Halliburton"),
    ("flc-extreme", "Impact"),
    ("emi-1900", "Schlumberger"),
    ("emi-1901", "Schlumberger"),
    ("g-sealfine", "Schlumberger"),
    ("safecarb1400", "Schlumberger"),
    ("safecarb2500", "Schlumberger"),
    ("sureseal", "Schlumberger"),
    ("torqueseal", "Schlumberger"),
]


class MatchProductListAndFile(unittest.TestCase):
    @staticmethod
    def test_missing_files():
        product_list = products_get()
        missing = {}
        for product in product_list:
            try:
                getCumulative(product["id"])
            except AzureMissingResourceHttpError:
                missing[product["id"]] = product

        missing = [p for p in missing.values()]
        missing.sort(key=lambda prod: prod["supplier"])
        assert [(m["id"], m["supplier"]) for m in missing] == known_missing_excel_files
