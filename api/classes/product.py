from typing import List


class Product:
    def __init__(self, product_id: str, share: float, cumulative: List[float], name="", sacks: int = 0, mass: int = 0):
        self.product_id = product_id
        self.share = share
        self.cumulative = cumulative
        self.name = name
        self.sacks = sacks
        self.mass = mass

    def add_shares_from_combination(self, combination: dict):
        only_positive = {k: v for k, v in combination.items() if v > 0}
        sum_sacks = sum(list(only_positive.values()))
        self.share = (100 / sum_sacks * combination[self.product_id]) / 100
