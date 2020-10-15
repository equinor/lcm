from azure.common import AzureMissingResourceHttpError
from flask import jsonify

from util.utils import getMaxAndMinValues
from calculators import Blend, Bridge, Optimizer
from util import DatabaseOperations as db
from util.Classes import Mode, Product

METADATA_TABLE_NAME = "Metadata"
BLEND_REQUEST = "MIX_PRODUCTS"  # Get Blend Mix
BRIDGE_REQUEST = "BRIDGE"  # Get the Optimal Bridge
OPTIMIZER_REQUEST = "OPTIMAL_MIX"  # Get the Optimal Blend Mix calculated by the Optimizer

PRODUCT_ID_REQUEST = "PRODUCT"  # Get all metadata for specific product based on ID
SIZE_STEPS_REQUEST = "SIZE_FRACTIONS"  # Get all the size steps
SPELLING_ERROR = "ENVIROMENTAL_IMPACT"  # Spelling error in SharePoint
ROUNDING_DECIMALS = 3
DEFAULT_MAX_ITERATIONS = 100

# These are all the options for the Bridge calculator
MAXIMUM_PORESIZE_OPTION = "MAXIMUM_PORESIZE"
AVERAGE_PORESIZE_OPTION = "AVERAGE_PORESIZE"
PERMEABILITY_OPTION = "PERMEABILITY"


# Optimizer handler. This function takes the HttpRequest
# object as input and returns the best combination of products
# aswell as the execution time, the fitness score and the
# amount of iterations.

# name, products, mass, weights, environmental
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
        option = AVERAGE_PORESIZE_OPTION

    if not max_iterations:
        max_iterations = DEFAULT_MAX_ITERATIONS
    if max_iterations < 0:
        max_iterations = 0

    if (not size_steps_filter) or (size_steps_filter < 0):
        size_steps_filter = 0
    elif size_steps_filter > 1:
        size_steps_filter = 1

    if option == MAXIMUM_PORESIZE_OPTION:
        mode = Mode.Maximum_Poresize
    elif option == PERMEABILITY_OPTION:
        mode = Mode.Permeability
    elif option == AVERAGE_PORESIZE_OPTION:
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

    products_metadata = {p: db.getMetadataFromID(p) for p in products}
    products_with_values = []

    # Add cumulative and distribution to each product
    for id, product_dict in products_metadata.items():
        try:
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
            getMaxAndMinValues(products_metadata),
            max_iterations,
            size_steps_filter,
        )
    except Exception as e:
        import sys, traceback

        traceback.print_exc(file=sys.stdout)
        return f"Probably invalid inputs! {e}", 400

    mass_sum = 0
    # TODO: This makes the next for loops useless...
    # products = []

    for product in products:
        product["mass"] = int(best[product["id"]]) * product["sack_size"]
        mass_sum += product["mass"]

    for product in products:
        products.append(
            Product(
                product["id"],
                "",
                float(product["mass"]) / mass_sum,
                product["cumulative"],
                product["distribution"],
            )
        )

    optimal_cumulative, optimal_distribution = Blend.calculateBlendDistribution(products, size_steps)

    response_dict = {}
    blend_list = []

    for id in best:
        if best[id] > 0:
            blend_list.append({"id": id, "sacks": best[id]})

    response_dict["name"] = blend_name
    response_dict["products"] = blend_list
    response_dict["performance"] = {
        "best_fit": round(best_fit_score, ROUNDING_DECIMALS),
        "mass_fit": round(mass_score, ROUNDING_DECIMALS),
        "cost": round(cost_score, ROUNDING_DECIMALS),
        "co2": round(co2_score, ROUNDING_DECIMALS),
        "enviromental": round(enviromental_score, ROUNDING_DECIMALS),
    }
    response_dict["cumulative"] = [round(num, ROUNDING_DECIMALS) for num in optimal_cumulative]
    response_dict["distribution"] = [round(num, ROUNDING_DECIMALS) for num in optimal_distribution]
    response_dict["execution_time"] = round(exec_time, ROUNDING_DECIMALS)
    response_dict["iterations"] = iterations
    response_dict["fitness"] = round(fitness, ROUNDING_DECIMALS)
    response_dict["missingProducts"] = missing_product_list

    return response_dict
