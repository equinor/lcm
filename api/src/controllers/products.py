from cachetools import TTLCache, cached
from flask import Response

from calculators.fraction_interpolator import fraction_interpolator_and_extrapolator
from config import Config
from util.azure_table import get_table_service, sanitize_row_key


def sort_products(products: dict[str, dict]):
    values = list(products.values())
    values.sort(key=lambda p: (p["supplier"], p["id"]))

    return {v["id"]: v for v in values}


@cached(cache=TTLCache(maxsize=128, ttl=300))
def products_get():
    table_service = get_table_service()

    share_point_products = table_service.query_entities(Config.PRODUCT_TABLE_NAME)
    interpolated_products = table_service.query_entities(Config.CUSTOM_PRODUCT_TABLE)
    products = [*share_point_products, *interpolated_products]

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

    if not len(products_response):
        return Response("Failed to fetch products from storage", 500)

    sorted_products = sort_products(products_response)
    return sorted_products


def products_post(product_name: str, supplier_name: str, product_data: [[float, float]]) -> Response:
    product_id = sanitize_row_key(product_name)

    for p in product_data:
        if not len(p) == 2:
            return Response("Invalid product data. Must be two valid numbers for each line", 400)

        if not isinstance(p[0], float | int) or not isinstance(p[1], float | int):
            return Response("Invalid product data. Must be two valid numbers for each line", 400)

    sizes = [p[0] for p in product_data]
    cumulative = [p[1] for p in product_data]
    table_entry = {
        "PartitionKey": Config.CUSTOM_PRODUCT_TABLE,
        "RowKey": product_id,
        "id": product_id,
        "title": product_name,
        "supplier": supplier_name,
        "cumulative": str(fraction_interpolator_and_extrapolator(sizes, cumulative)),
        "sack_size": 25,
        "environment": "Green",
        "cost": 100,
        "co2": 1000,
    }

    get_table_service().insert_entity(Config.CUSTOM_PRODUCT_TABLE, table_entry)
    products_get.cache_clear()
    return table_entry
