from pathlib import Path

from util.excel import get_column_values, get_excel_files
from util.load_test_data import read_excel_sheet
from xlrd.sheet import Sheet
import pytest


def test_get_column_values():
    sheet: Sheet = read_excel_sheet(file_path=Path("tests/util/data.xlsx"))

    assert int(sum(get_column_values(sheet=sheet, column_name="Distribution"))) == 100
    assert int(sum(get_column_values(sheet=sheet, column_name="Cumulative"))) == 4561
    with pytest.raises(Exception):
        get_column_values(sheet=sheet, column_name="Column that does not exist")


def test_get_excel_files():
    assert len(get_excel_files("tests/util")) == 1
