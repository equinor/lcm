from dataclasses import dataclass


@dataclass
class Product:
    product_id: str
    share: float
    cumulative: list[float]
    name: str = ""
    sacks: int = 0
    mass: float = 0.0
