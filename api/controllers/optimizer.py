from typing import Dict, List, Tuple

from flask import Response

from calculators.bridge import theoretical_bridge
from calculators.optimizer import Optimizer
from classes.product import Product
from controllers.products import products_get


def optimizer_request_handler(
    value,
    blend_name,
    products,
    mass_goal,
    option="AVERAGE_PORESIZE",
    iterations: int = 500,
    max_products: int = 999,
    particle_range: Tuple[float, float] = (1.0, 100),
    weights: Dict = None,
):
    int_iterations = int(iterations)
    if int_iterations <= 0:
        return Response("Number of iterations must be a positiv integer", 400)

    if particle_range[0] >= particle_range[1]:
        return Response("Particle size 'from' must be smaller than 'to'", 400)

    if max_products == 0:
        max_products = 999

    if not weights:
        weights = {"bridge": 5, "mass": 5, "products": 5}
    else:
        for i in weights.values():
            if not 0 <= i <= 10:
                return Response("Weighting values must be between 1 and 10", 400)

    print(f"Started optimization request with {int_iterations} maximum iterations...")
    bridge = theoretical_bridge(option, value)
    selected_products = [p for p in products_get().values() if p["id"] in products]
    if len(selected_products) < 2:
        return Response("Can not run the optimizer with less than two products", 400)

    optimizer = Optimizer(
        products=selected_products,
        bridge=bridge,
        mass_goal=mass_goal,
        max_iterations=int_iterations,
        max_products=max_products,
        particle_range=particle_range,
        weights=weights,
    )
    optimizer_result = optimizer.optimize()
    combination = optimizer_result["combination"]

    products_result: List[Product] = []
    for p in selected_products:
        if p["id"] in combination.keys():
            products_result.append(
                Product(
                    product_id=p["id"],
                    share=combination[p["id"]] / sum(combination.values()),
                    cumulative=p["cumulative"],
                    sacks=combination[p["id"]],
                    mass=(combination[p["id"]] * p["sack_size"]),
                )
            )

    return {
        "name": blend_name,
        "config": {"iterations": optimizer_result["iterations"], "value": value, "mode": option},
        "products": {id: {"id": id, "value": combination[id]} for id in combination},
        "performance": optimizer.calculate_performance(
            experimental_bridge=optimizer_result["cumulative_bridge"],
            products_result=products_result,
        ),
        "totalMass": sum([p.mass for p in products_result]),
        "cumulative": optimizer_result["cumulative_bridge"],
        "executionTime": optimizer_result["execution_time"].seconds,
        "fitness": optimizer_result["score"],
        "weighting": {
            "bridge": weights["bridge"],
            "mass": weights["mass"],
            "products": weights["products"],
        },
        "curve": optimizer_result["curve"],
    }
