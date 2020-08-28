# This module contains classes used by the program

# import typing
# import json
from enum import IntEnum


class Product:
    def __init__(self, product_id, name, share, cumulative, distribution):
        self.product_id = product_id
        self.name = name
        self.share = share
        self.cumulative = cumulative
        self.distribution = distribution

    def to_string(self) -> str:
        return (
            self.product_id
            + "|"
            + str(self.name)
            + "|"
            + str(self.share)
            + "|"
            + str(self.cumulative)
            + "|"
            + str(self.distribution)
        )

    def from_string(json_str: str) -> object:
        data_list = json_str.split("|")

        product_id = data_list[0]

        name = data_list[1]

        share = float(data_list[2])

        cumulative = data_list[3].strip("[]").split(", ")

        for i in range(len(cumulative)):
            cumulative[i] = float(cumulative[i])

        distribution = data_list[4].strip("[]").split(", ")

        for i in range(len(distribution)):
            distribution[i] = float(distribution[i])

        obj = Product(product_id, name, share, cumulative, distribution)

        return obj


class Mode(IntEnum):
    Permeability = 0
    Average_Poresize = 1
    Maximum_Poresize = 2
