# Blend handler. This function takes the HttpRequest
# object as input and returns the cumulative distribution
# of a blend, based on the given input data.

from calculators.bridge import calculate_blend_cumulative
from classes.product import Product
from use_cases.get_products import retrieve_products
from util.exceptions import InternalErrorException


def bridge_from_combination(combination: list[dict]):
    all_products = retrieve_products()
    sum_sacks = sum([p["value"] for p in combination])
    product_list = []
    for p in combination:
        if p["value"] <= 0:
            continue
        product_dto = all_products[p["id"]]
        if product_dto.cumulative is None:
            raise InternalErrorException(f"Product {p['id']} does not have cumulative distribution data")
        product_list.append(
            Product(
                product_id=p["id"],
                share=(100 / sum_sacks * p["value"]) / 100,
                cumulative=product_dto.cumulative,
            )
        )
    bridge = calculate_blend_cumulative(product_list)
    return {"bridge": [round(num, 1) for num in bridge]}
