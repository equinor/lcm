from cachetools import cached, TTLCache

from config import Config
from util.azure_table import get_service


@cached(cache=TTLCache(maxsize=128, ttl=300))
def products_get():
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

    return products_response
