import json
from dataclasses import asdict, dataclass

from cachetools import TTLCache, cached

from config import Config
from util.azure_table import get_service
from util.exceptions import InternalErrorException
from util.utils import convert_keys_underscore_to_camel


@dataclass
class ProductDTO:
    id: str
    title: str
    supplier: str
    co2: float
    cost: float
    environmental: str
    sack_size: int
    cumulative: list[float] | None

    @classmethod
    def from_db_entity(cls, entity) -> "ProductDTO":
        cumulative = json.loads(entity.get("cumulative")) if entity.get("cumulative") else None
        return cls(
            id=entity.id,
            title=entity.title,
            supplier=entity.supplier,
            co2=entity.co2,
            cost=entity.cost,
            environmental=entity.environmental,
            sack_size=entity.sack_size,
            cumulative=cumulative,
        )


def _sort_product_dict(products: dict[str, ProductDTO]) -> dict[str, ProductDTO]:
    values = list(products.values())
    values.sort(key=lambda p: (p.supplier, p.id))

    return {v.id: v for v in values}


def retrieve_products() -> dict[str, ProductDTO]:
    products = get_service().query_entities(Config.PRODUCT_TABLE_NAME)

    products_response = {}
    for p in products:
        product_dto = ProductDTO.from_db_entity(p)
        products_response[p.RowKey] = product_dto

    sorted_products = _sort_product_dict(products_response)

    if not len(sorted_products):
        raise InternalErrorException("No products found in storage")

    return sorted_products


@cached(cache=TTLCache(maxsize=128, ttl=300))
def get_products():
    products_response = retrieve_products()
    return convert_keys_underscore_to_camel({k: asdict(v) for k, v in products_response.items()})
