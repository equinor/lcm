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
    bridge = theoretical_bridge(bridge_mode_int(option), value)
    selected_products = [p for p in products_get().values() if p["id"] in products]
    optimizer_result = optimize(products=selected_products, bridge=bridge, mass=mass_goal)
    combination = optimizer_result["combination"]

    return {
        "name": blend_name,
        "products": [{"id": id, "sacks": combination[id]} for id in combination if combination[id] > 0],
        "performance": {
            # "best_fit": round(best_fit_score, Config.ROUNDING_DECIMALS),
            # "mass_fit": round(mass_score, Config.ROUNDING_DECIMALS),
            # "cost": round(cost_score, Config.ROUNDING_DECIMALS),
            # "co2": round(co2_score, Config.ROUNDING_DECIMALS),
            # "enviromental": round(enviromental_score, Config.ROUNDING_DECIMALS),
        },
        "cumulative": optimizer_result["cumulative_bridge"],
        "executionTime": optimizer_result["execution_time"],
        "iterations": optimizer_result["iterations"],
        "fitness": optimizer_result["score"],
    }
