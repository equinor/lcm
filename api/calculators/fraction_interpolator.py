import csv
from copy import copy

from calculators.bridge import SIZE_STEPS
from numpy import log


def lookup_smaller(table: dict, value: float):
    n = [i for i in table.keys() if i <= value]
    return max(n)


def lookup_bigger(table: dict, value: float):
    n = [i for i in table.keys() if i >= value]
    return min(n)


def fraction_interpolator(x: list[float], y: list[float], z: list[float]) -> list[float]:
    table_dict = dict(zip(x, y, strict=False))
    max_x = max(x)

    z_table = {}
    for _z in z:
        if _z > max_x:
            break
        smaller_x = lookup_smaller(table_dict, _z)
        bigger_x = lookup_bigger(table_dict, _z)
        z_table[_z] = {"x1": smaller_x, "x2": bigger_x, "y1": table_dict[smaller_x], "y2": table_dict[bigger_x]}

    for zz, values in z_table.items():
        x1 = values["x1"]
        x2 = values["x2"]
        y1 = values["y1"]
        y2 = values["y2"]

        values["j"] = (y2 - y1) / (log(x2) - log(x1)) * (log(zz) - log(x1)) + y1
    return [round(v["j"], 3) for v in z_table.values()]


def from_csv_to_csv():
    with open("test_data/interpolate_input.csv") as csvfile:
        reader = csv.DictReader(csvfile)
        fields_copy = copy(reader.fieldnames)
        fields_copy.pop(0)
        products = {name: [] for name in fields_copy}
        a_x = []
        for line in reader:
            a_x.append(float(line["Size"]))
            for n in products:
                products[n].append(float(line[n]))

        for name in products:
            b_y = fraction_interpolator(x=a_x, y=products[name], z=SIZE_STEPS)
            with open(f"test_data/{name}.csv", "w+") as newcsvfile:
                writer = csv.DictWriter(newcsvfile, fieldnames=["Size", "Cumulative"])
                writer.writeheader()
                for step, interpol_value in zip(SIZE_STEPS, b_y, strict=False):
                    writer.writerow({"Size": step, "Cumulative": interpol_value})


if __name__ == "__main__":
    from_csv_to_csv()
