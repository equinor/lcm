class Product:
    def __init__(self, product_id: str, share: float, cumulative: list[float], name="", sacks: int = 0, mass: int = 0):
        self.product_id = product_id
        self.share = share
        self.cumulative = cumulative
        self.name = name
        self.sacks = sacks
        self.mass = mass
