# This module can be used to transform between 
# IDs and names of products in the Azure tables database.
from . import DatabaseOperations as db

METADATA_TABLE_NAME = "Metadata"


def nameFromID(id):
    products_dict = db.listProducts()

    for name in products_dict:
        if products_dict[name] == id:
            return name

    return "NAME"


def IDFromName(name):
    products_dict = db.listProducts()

    if name in products_dict:
        return products_dict[name]

    return -1



