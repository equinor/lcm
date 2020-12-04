from typing import Tuple

from flask import Response

from calculators.bridge import theoretical_bridge
from calculators.optimizer import Optimizer
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
):
    int_iterations = int(iterations)
    if int_iterations <= 0:
        return Response("Number of iterations must be a positiv integer", 400)

    if particle_range[0] >= particle_range[1]:
        return Response("Particle size 'from' must be smaller than 'to'", 400)

    if max_products == 0:
        max_products = 999

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
    )
    optimizer_result = optimizer.optimize()

    combination = optimizer_result["combination"]

    total_mass: float = 0.0
    for product_name, sacks in combination.items():
        sack_size = next((p["sack_size"] for p in selected_products))
        total_mass += sacks * sack_size

    return {
        "name": blend_name,
        "config": {"iterations": optimizer_result["iterations"], "value": value, "mode": option},
        "products": {id: {"id": id, "value": combination[id]} for id in combination},
        "performance": optimizer.calculate_performance(
            experimental_bridge=optimizer_result["cumulative_bridge"],
            mass_result=total_mass,
            products_result=len(combination),
        ),
        "totalMass": total_mass,
        "cumulative": optimizer_result["cumulative_bridge"],
        "executionTime": optimizer_result["execution_time"].seconds,
        "fitness": optimizer_result["score"],
        "weighting": {
            "bridge": 0.5,
            "cost": 0.5,
            "co2": 0.5,
            "environmental": 0.5,
        },
        "curve": optimizer_result["curve"],
    }
