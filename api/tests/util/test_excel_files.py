from pathlib import Path

from util.excel_files import get_column_values, get_excel_files
from util.load_test_data import read_excel_sheet, find_column_index
from xlrd.sheet import Sheet
import pytest


def test_get_column_values():
    sheet: Sheet = read_excel_sheet(file_path=Path("tests/util/data.xlsx"))
    column_index = find_column_index(sheet=sheet, column_name="Distribution")
    # The distribution sum should equal to 100
    assert int(sum(get_column_values(sheet=sheet, column_index=column_index))) == 100


def test_find_column_index():
    sheet: Sheet = read_excel_sheet(file_path=Path("tests/util/data.xlsx"))
    distribution_column_index = find_column_index(sheet=sheet, column_name="Distribution")
    assert distribution_column_index == 1
    cumulative_column_index = find_column_index(sheet=sheet, column_name="Cumulative")
    assert cumulative_column_index == 2
    with pytest.raises(Exception):
        find_column_index(sheet=sheet, column_name="Column that does not exist")


def test_get_excel_files():
    files = get_excel_files("tests/util")
    assert len(files) == 1
