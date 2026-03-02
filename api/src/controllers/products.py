from cachetools import TTLCache, cached
from flask import Response

from config import Config
from util.azure_table import get_service


def sort_products(products: dict[str, dict]) -> dict[str, dict]:
    values = list(products.values())
    values.sort(key=lambda p: (p["supplier"], p["id"]))

    return {v["id"]: v for v in values}


def retrieve_products() -> dict[str, dict]:
    products = get_service().query_entities(Config.PRODUCT_TABLE_NAME)

    products_response = {}
    for p in products:
        products_response[p.RowKey] = dict(p)
        del products_response[p.RowKey]["PartitionKey"]
        del products_response[p.RowKey]["RowKey"]
        del products_response[p.RowKey]["Timestamp"]
        del products_response[p.RowKey]["etag"]
        products_response[p.RowKey]["sackSize"] = p.sack_size
        cumulative = (
            [float(v) for v in p.get("cumulative").replace("[", "").replace("]", "").split(",")]
            if p.get("cumulative")
            else None
        )
        products_response[p.RowKey]["cumulative"] = cumulative

    sorted_products = sort_products(products_response)

    if not len(sorted_products):
        raise ValueError("No products found in storage")

    return sorted_products


@cached(cache=TTLCache(maxsize=128, ttl=300))
def products_get():
    try:
        products_response = retrieve_products()
        return products_response
    except ValueError:
        return Response("Failed to fetch products from storage", 500)
