from typing import List

from calculators.bridge import theoretical_bridge
from calculators.optimizer import optimize
from controllers.products import products_get
from util.enums import bridge_mode_int


def optimizerRequestHandler(
    value,
    blend_name,
    products,
    mass_goal,
    option="AVERAGE_PORESIZE",
):
    print("Started optimization request...")
    bridge = theoretical_bridge(option, value)
    selected_products = [p for p in products_get().values() if p["id"] in products]
    optimizer_result = optimize(products=selected_products, bridge=bridge, mass=mass_goal)
    combination = optimizer_result["combination"]

    total_mass: float = 0.0
    for product_name, sacks in combination.items():
        sack_size = next((p["sack_size"] for p in selected_products))
        total_mass += sacks * sack_size

    return {
        "name": blend_name,
        "config": {"iterations": optimizer_result["iterations"], "value": value, "mode": option},
        "products": {id: {"id": id, "value": combination[id]} for id in combination},
        "performance": {
            "best_fit": 0.5,
            "mass_fit": 0.5,
            "cost": 0.5,
            "co2": 0.5,
            "environmental": 0.5,
        },
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
    }
