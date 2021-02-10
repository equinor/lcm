# Blend handler. This function takes the HttpRequest
# object as input and returns the cumulative distribution
# of a blend, based on the given input data.
from typing import List

from calculators.bridge import calculate_blend_cumulative
from classes.product import Product
from controllers.products import products_get


def bridge_from_combination(combination: List[dict]):
    all_products = products_get()
    sum_sacks = sum([p["value"] for p in combination])
    product_list = []
    for p in combination:
        if p["value"] <= 0:
            continue
        product_list.append(
            Product(
                product_id=p["id"],
                share=(100 / sum_sacks * p["value"]) / 100,
                cumulative=all_products[p["id"]]["cumulative"],
            )
        )
    bridge = calculate_blend_cumulative(product_list)
    return {"bridge": [round(num, 1) for num in bridge]}
