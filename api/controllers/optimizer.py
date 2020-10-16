from azure.common import AzureMissingResourceHttpError
from flask import Response

from config import Config
from util.enums import BridgeOption
from util.utils import getMaxAndMinValues
from calculators import Blend, Bridge, Optimizer
from util import DatabaseOperations as db
from util.Classes import Mode, Product


def optimizerRequestHandler(
    value,
    blend_name,
    products,
    mass_goal,
    weight_dict,
    environmental_list,
    option,
    max_iterations,
    size_steps_filter,
):
    print("Started optimization request...")
    missing_product_list = []

    if not weight_dict:
        weight_dict = {"best_fit": 100.0, "cost": 0.0, "co2": 0.0, "mass_fit": 0.0}
    else:
        try:
            sum = 0
            for key in weight_dict:
                if (weight_dict[key] > 100) or (weight_dict[key] < 0):
                    raise ValueError()
                sum += weight_dict[key]
            if (sum < 95) or (sum >= 105):
                raise ValueError()
        except (KeyError, TypeError, ValueError) as e:
            raise e

    if not option:
        option = BridgeOption.AVERAGE_PORESIZE_OPTION

    if not max_iterations:
        max_iterations = Config.DEFAULT_MAX_ITERATIONS
    if max_iterations < 0:
        max_iterations = 0

    if (not size_steps_filter) or (size_steps_filter < 0):
        size_steps_filter = 0
    elif size_steps_filter > 1:
        size_steps_filter = 1

    if option == BridgeOption.MAXIMUM_PORESIZE_OPTION:
        mode = Mode.Maximum_Poresize
    elif option == BridgeOption.PERMEABILITY_OPTION:
        mode = Mode.Permeability
    elif option == BridgeOption.AVERAGE_PORESIZE_OPTION:
        mode = Mode.Average_Poresize
    else:
        raise Exception("Invalid mode")
    size_steps = db.getSizeSteps()

    if value:
        try:
            bridge = Bridge.calculateBridgeDistribution(mode, value, size_steps)
        except Exception as e:
            raise e
    else:
        raise Exception("Missing 'value'")

    products_with_values = []
    # Add cumulative and distribution to each product
    for id in products:
        try:
            product_dict = db.getMetadataFromID(id)
            product_dict["cumulative"] = db.getCumulative(id)
            product_dict["distribution"] = db.getDistribution(id)
            product_dict["id"] = id
            products_with_values.append(product_dict)
        except AzureMissingResourceHttpError:
            print(f"Product with ID '{id}' is missing or has a different name")
            missing_product_list.append(id)
            continue
        except Exception as e:
            raise e
    if not products_with_values:
        return Response("No products selected or they were missing", 400)

    try:
        weights = [
            float(weight_dict["best_fit"]) / 100,
            float(weight_dict["cost"]) / 100,
            float(weight_dict["co2"]) / 100,
            float(weight_dict["mass_fit"]) / 100,
        ]
    except Exception as e:
        raise Exception(e)

    try:
        (
            best,
            best_fit_score,
            mass_score,
            cost_score,
            co2_score,
            enviromental_score,
            exec_time,
            iterations,
            fitness,
        ) = Optimizer.optimize(
            products_with_values,
            weights,
            bridge,
            mass_goal,
            getMaxAndMinValues(products_with_values),
            max_iterations,
            size_steps_filter,
        )
    except Exception as e:
        import sys, traceback

        traceback.print_exc(file=sys.stdout)
        return f"Probably invalid inputs! {e}", 400

    mass_sum = 0
    for product in products_with_values:
        product["mass"] = int(best[product["id"]]) * product["sack_size"]
        mass_sum += product["mass"]

    product_list = []
    for product in products_with_values:
        product_list.append(
            Product(
                product_id=product["id"],
                name="",
                share=float(product["mass"]) / mass_sum,
                cumulative=product["cumulative"],
                distribution=product["distribution"],
            )
        )

    optimal_cumulative, optimal_distribution = Blend.calculateBlendDistribution(product_list, size_steps)

    response_dict = {
        "name": blend_name,
        "products": [{"id": id, "sacks": best[id]} for id in best if best[id] > 0],
        "performance": {
            "best_fit": round(best_fit_score, Config.ROUNDING_DECIMALS),
            "mass_fit": round(mass_score, Config.ROUNDING_DECIMALS),
            "cost": round(cost_score, Config.ROUNDING_DECIMALS),
            "co2": round(co2_score, Config.ROUNDING_DECIMALS),
            "enviromental": round(enviromental_score, Config.ROUNDING_DECIMALS),
        },
        "cumulative": [round(num, Config.ROUNDING_DECIMALS) for num in optimal_cumulative],
        "distribution": [round(num, Config.ROUNDING_DECIMALS) for num in optimal_distribution],
        "execution_time": round(exec_time, Config.ROUNDING_DECIMALS),
        "iterations": iterations,
        "fitness": round(fitness, Config.ROUNDING_DECIMALS),
        "missingProducts": missing_product_list,
    }

    return response_dict
