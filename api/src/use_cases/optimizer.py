from dataclasses import asdict, dataclass, field

from calculators.bridge import theoretical_bridge
from calculators.optimizer import Optimizer, OptimizerWeights
from classes.product import Product
from use_cases.products import retrieve_products
from util.exceptions import ValidationExpection


@dataclass
class OptimizerParameterProduct:
    id: str
    title: str
    supplier: str
    environmental: str
    sack_size: int
    co2: int
    cost: int
    cumulative: list[float]


@dataclass
class OptimizerParameters:
    request: str
    name: str
    value: float
    products: dict[str, OptimizerParameterProduct]
    density: float
    volume: float
    option: str = "AVERAGE_PORESIZE"
    iterations: int = 500
    max_products: int = 999
    particle_range: tuple[float, float] = (1.0, 100)
    weights: OptimizerWeights = field(default_factory=lambda: OptimizerWeights(bridge=5, mass=5, products=5))

    def __post_init__(self):
        if self.iterations <= 0:
            raise ValidationExpection("Number of iterations must be a positive integer")
        if self.particle_range[0] >= self.particle_range[1]:
            raise ValidationExpection("Particle size 'from' must be smaller than 'to'")
        if self.max_products == 0:
            self.max_products = 999
        if type(self.weights) is dict:
            self.weights = OptimizerWeights(**self.weights)


@dataclass
class OptimizerResultConfiguration:
    iterations: int
    value: float
    mode: str


@dataclass
class OptimizerResultProduct:
    id: str
    value: float


@dataclass
class OptimizerResult:
    name: str
    config: OptimizerResultConfiguration
    products: dict[str, OptimizerResultProduct]
    performance: dict
    totalMass: float
    cumulative: list[float]
    executionTime: int
    fitness: float
    weighting: OptimizerWeights
    curve: list[float]
    bridgeScore: float


def run_optimizer(parameter_dict: dict) -> dict:
    parameters = OptimizerParameters(**parameter_dict)

    print(f"Started optimization request with {parameters.iterations} maximum iterations...")
    bridge = theoretical_bridge(parameters.option, parameters.value)
    selected_products = [p for p in retrieve_products().values() if p["id"] in parameters.products]
    if len(selected_products) < 2:
        raise ValidationExpection("Can not run the optimizer with less than two products")

    optimizer = Optimizer(
        bridge=bridge,
        products=selected_products,
        density_goal=parameters.density,
        volume=parameters.volume,
        max_iterations=parameters.iterations,
        max_products=parameters.max_products,
        particle_range=parameters.particle_range,
        weights=parameters.weights,
    )
    optimizer_result = optimizer.optimize()
    combination = optimizer_result.combination

    products_result: list[Product] = []
    for p in selected_products:
        if p["id"] in combination.keys():
            products_result.append(
                Product(
                    product_id=p["id"],
                    share=combination[p["id"]] / sum(combination.values()),
                    cumulative=p["cumulative"],
                    sacks=combination[p["id"]],
                    mass=(combination[p["id"]] * parameters.volume),
                )
            )

    return asdict(
        OptimizerResult(
            name=parameters.name,
            config=OptimizerResultConfiguration(
                iterations=optimizer_result.iterations, value=parameters.value, mode=parameters.option
            ),
            products={id: OptimizerResultProduct(id=id, value=combination[id]) for id in combination},
            performance=optimizer.calculate_performance(
                experimental_bridge=optimizer_result.cumulative_bridge,
                products_result=products_result,
            ),
            totalMass=round(sum([p.mass for p in products_result]), 1),
            cumulative=optimizer_result.cumulative_bridge,
            executionTime=int(optimizer_result.execution_time.microseconds / 1000),
            fitness=optimizer_result.score,
            weighting=parameters.weights,
            curve=optimizer_result.curve,
            bridgeScore=optimizer_result.bridge_score,
        )
    )
