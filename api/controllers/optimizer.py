from flask import Response

from calculators.bridge import theoretical_bridge
from calculators.optimizer import optimize
from util import DatabaseOperations as db
from util.DatabaseOperations import all_cumulatives
from util.enums import bridge_mode_int, BridgeOption


def optimizerRequestHandler(
    value,
    blend_name,
    products,
    mass_goal,
    option="AVERAGE_PORESIZE",
):
    print("Started optimization request...")
    missing_product_list = []

    if value:
        bridge = theoretical_bridge(bridge_mode_int(option), value)
    else:
        raise Exception("Missing 'value'")

    all_cumulative = all_cumulatives()
    # all_distribution = all_distributions()
    products_with_values = []

    # Add cumulative and distribution to each product
    for id in products:
        try:
            product_dict = db.getMetadataFromID(id)
            product_dict["cumulative"] = all_cumulative[id]
            # product_dict["distribution"] = all_distribution[id]
            product_dict["id"] = id
            products_with_values.append(product_dict)
        except KeyError:
            print(f"Product with ID '{id}' is missing or has a different name")
            missing_product_list.append(id)
            continue

    if not products_with_values:
        missing_message = f"These products where missing; {missing_product_list}" if missing_product_list else ""
        return Response(f"No products selected or they were missing\n{missing_message}", 400)

    optimizer_result = optimize(products=products_with_values, bridge=bridge, mass=mass_goal)

    combination = optimizer_result["combination"]

    mass_sum = 0
    for product in products_with_values:
        product["mass"] = int(combination[product["id"]]) * product["sack_size"]
        mass_sum += product["mass"]

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
        # "distribution": optimizer_result["distribution_bridge"],
        "executionTime": optimizer_result["execution_time"],
        "iterations": optimizer_result["iterations"],
        "fitness": optimizer_result["score"],
        "missingProducts": missing_product_list,
    }
