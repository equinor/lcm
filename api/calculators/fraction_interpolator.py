from copy import copy
from typing import List
from scipy.interpolate import interp1d
import csv

from calculators.bridge import SIZE_STEPS


def fraction_interpolator(a_x: List[float], a_y: List[float], b_x: List[float]) -> List[float]:
    interpolation_function = interp1d(a_x, a_y)
    res = interpolation_function(b_x)
    return list(res)


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
            b_y = fraction_interpolator(a_x=a_x, a_y=products[name], b_x=SIZE_STEPS)
            with open(f"test_data/{name}.csv", "w+") as newcsvfile:
                writer = csv.DictWriter(newcsvfile, fieldnames=["Size", "Cumulative"])
                writer.writeheader()
                for step, interpol_value in zip(SIZE_STEPS, b_y):
                    writer.writerow({"Size": step, "Cumulative": interpol_value})


if __name__ == "__main__":
    from_csv_to_csv()
