from math import sqrt

from cachetools import LFUCache, cached
from classes.product import Product
from util.enums import BridgeOption


@cached(cache=LFUCache(2048))
def theoretical_bridge(mode: str, value: int):
    bridge_list = []
    d_value = 50
    bridge_input = value

    if mode == BridgeOption.PERMEABILITY:
        bridge_input = sqrt(value)
    elif mode == BridgeOption.MAXIMUM_PORESIZE:
        d_value = 90
    elif mode in (BridgeOption.AVERAGE_PORESIZE, BridgeOption.CERAMIC_DISCS):
        pass
    else:
        raise ValueError(f"Invalid bridge mode string '{mode}'")

    result = 100 * (sqrt(bridge_input) / d_value)

    for size in SIZE_STEPS:
        if sqrt(size) > result:
            bridge_list.append(100)
        else:
            bridge_list.append(round(100 * sqrt(size) / result, 3))

    return bridge_list


def calculate_blend_cumulative(product_list: list[Product]):
    cumulative_curve: list[float] = [0.0 for _ in SIZE_STEPS]

    for product in product_list:
        if product.share > 0:
            for i, _ in enumerate(SIZE_STEPS):
                cumulative_curve[i] += product.share * product.cumulative[i]

    return cumulative_curve


SIZE_STEPS = [
    0.01,
    0.0114,
    0.0129,
    0.0147,
    0.0167,
    0.0189,
    0.0215,
    0.0244,
    0.0278,
    0.0315,
    0.0358,
    0.0407,
    0.0463,
    0.0526,
    0.0597,
    0.0679,
    0.0771,
    0.0876,
    0.0995,
    0.113,
    0.128,
    0.146,
    0.166,
    0.188,
    0.214,
    0.243,
    0.276,
    0.314,
    0.357,
    0.405,
    0.46,
    0.523,
    0.594,
    0.675,
    0.767,
    0.872,
    0.991,
    1.13,
    1.28,
    1.45,
    1.65,
    1.88,
    2.13,
    2.42,
    2.75,
    3.12,
    3.55,
    4.03,
    4.58,
    5.21,
    5.92,
    6.72,
    7.64,
    8.68,
    9.86,
    11.2,
    12.7,
    14.5,
    16.4,
    18.7,
    21.2,
    24.1,
    27.4,
    31.1,
    35.3,
    40.1,
    45.6,
    51.8,
    58.9,
    66.9,
    76,
    86.4,
    98.1,
    111,
    127,
    144,
    163,
    186,
    211,
    240,
    272,
    310,
    352,
    400,
    454,
    516,
    586,
    666,
    756,
    859,
    976,
    1110,
    1260,
    1430,
    1630,
    1850,
    2100,
    2390,
    2710,
    3080,
    3500,
]
