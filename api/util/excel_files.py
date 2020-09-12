from typing import List

import xlrd
from pathlib import Path

from xlrd.sheet import Sheet


def get_column_values(sheet: Sheet, column_index: int) -> List:
    values = []
    for i in range(1, sheet.nrows):
        values.append(sheet.cell_value(i, column_index))
    return values


def find_column_index(sheet: Sheet, column_name: str) -> int:
    distribution_index = -1

    for i in range(sheet.ncols):
        if sheet.cell_value(0, i) == column_name:
            distribution_index = i
            break

    if distribution_index == -1:
        raise Exception(f"Sheet does not contain column {column_name}")

    return distribution_index


def get_excel_files(directory: str) -> List[Path]:
    return [x for x in Path(directory).rglob("*") if x.is_file() and x.suffix == ".xlsx"]


def read_excel_sheet(file_path: Path) -> Sheet:
    absolute_path = str(file_path.absolute())
    workbook = xlrd.open_workbook(absolute_path)
    sheet = workbook.sheet_by_index(0)
    return sheet
