from typing import List

import xlrd

from xlrd.sheet import Sheet


def get_column_values(sheet: Sheet, column_name: str) -> List:
    column_index = _find_column_index(sheet, column_name)

    if column_index == -1:
        raise Exception(f"Sheet does not contain column {column_name}")

    values = []
    for i in range(1, sheet.nrows):
        values.append(sheet.cell_value(i, column_index))
    return values


def _find_column_index(sheet: Sheet, column_name: str) -> int:
    distribution_index = -1

    for i in range(sheet.ncols):
        if sheet.cell_value(0, i) == column_name:
            distribution_index = i
            break

    return distribution_index


def excel_raw_file_to_sheet(file: bytes) -> Sheet:
    workbook = xlrd.open_workbook(file_contents=file)
    sheet = workbook.sheet_by_index(0)
    return sheet


def sheet_to_bridge_dict(sheet: Sheet) -> dict:
    return {
        "cumulative": get_column_values(sheet, "Cumulative"),
        "distribution": get_column_values(sheet, "Distribution"),
    }
