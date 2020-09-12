# This module is triggered by an HTTP request from the front-end.
# Based on the request body, the correct data are then returned
# from either the database or the data layer.

import json
import logging

from flask import abort, Flask, jsonify, request, Response

from calculators import Blend, Bridge, Optimizer
from util import DatabaseOperations as db
from util.Classes import Mode, Product

METADATA_TABLE_NAME = "Metadata"
BLEND_REQUEST = "MIX_PRODUCTS"  # Get Blend Mix
BRIDGE_REQUEST = "BRIDGE"  # Get the Optimal Bridge
OPTIMIZER_REQUEST = (
    "OPTIMAL_MIX"  # Get the Optimal Blend Mix calculated by the Optimizer
)
PRODUCT_LIST_REQUEST = "PRODUCT_LIST"  # Get all Metadata
PRODUCT_ID_REQUEST = "PRODUCT"  # Get all metadata for specific product based on ID
SIZE_STEPS_REQUEST = "SIZE_FRACTIONS"  # Get all the size steps
SPELLING_ERROR = "ENVIROMENTAL_IMPACT"  # Spelling error in SharePoint
ROUNDING_DECIMALS = 3
DEFAULT_MAX_ITERATIONS = 100

# These are all the options for the Bridge calculator
MAXIMUM_PORESIZE_OPTION = "MAXIMUM_PORESIZE"
AVERAGE_PORESIZE_OPTION = "AVERAGE_PORESIZE"
PERMEABILITY_OPTION = "PERMEABILITY"

app = Flask(__name__)


@app.route('/api', methods=["GET", "POST"])
def main():
    logging.info("Python HTTP trigger function processed a request.")
    requst_ = request.json.get("request")
    if not requst_:
        try:
            req_body = request.json
        except ValueError:
            abort(400)
        else:
            print("####################")
            print("WHY EM I HERE!")
            print("####################")
            requst_ = req_body.get("request")

    if requst_ == BLEND_REQUEST:
        return blendRequestHandler(request.json.get("products"))

    elif requst_ == BRIDGE_REQUEST:
        return bridgeRequestHandler(request.json.get("option"), request.json.get("value"))

    elif requst_ == OPTIMIZER_REQUEST:
        value = request.json.get("value")
        name = request.json.get("name")
        products = request.json.get("products")
        mass = request.json.get("mass")
        weights = request.json.get("weights")
        environmental = request.json.get("environmental")
        option = request.json.get("option")
        iterations = request.json.get("max_iterations")
        size_step = request.json.get("size_steps_filter")

        return optimizerRequestHandler(value, name, products, mass, weights, environmental, option, iterations,
                                       size_step)

    elif requst_ == PRODUCT_LIST_REQUEST:
        return productListRequestHandler(request.json.get("filters"), request.json.get("metadata"))

    elif requst_ == PRODUCT_ID_REQUEST:
        return productRequestHandler(request.json.get("id"), request.json.get("metadata"))

    elif requst_ == SIZE_STEPS_REQUEST:
        return sizeStepsRequestHandler()

    elif requst_:
        abort(400)

    else:
        abort(400)


# Blend handler. This function takes the HttpRequest
# object as input and returns the cumulative distribution
# of a blend, based on the given input data.
def blendRequestHandler(products):
    if not products:
        return Response("No products given!", 400)

    product_list = []
    percent_sum = 0

    try:
        for product in products:
            if not product.get("percents"):
                return f"Product {product['id']} is missing percentage!", 400
            percent_sum += product["percents"]

            cumulative = db.getCumulative(product["id"])
            distribution = db.getCumulative(product["id"])

            product_list.append(
                Product(
                    product["id"],
                    "",
                    float(product["percents"]) / 100,
                    cumulative,
                    distribution,
                )
            )

        print(percent_sum)
        if percent_sum != 100:
            abort(400)

    except Exception as e:
        print(e)
        return jsonify(e), 400

    size_steps = db.getSizeSteps()
    try:
        cumulative, distribution = Blend.calculateBlendDistribution(
            product_list, size_steps
        )
    except Exception as e:
        return jsonify(e), 400

    response_dict = {
        "cumulative": [round(num, ROUNDING_DECIMALS) for num in cumulative],
        "distribution": [round(num, ROUNDING_DECIMALS) for num in distribution],
    }

    return response_dict


# Bridge handler. This function takes the HttpRequest
# object as input and returns a calculated bridge
# distribution based on the input data and options.
def bridgeRequestHandler(option, value):
    if not value or not option:
        return Response("No options or value given!", 400)

    error_list = []
    mode = None
    if option:
        if option == MAXIMUM_PORESIZE_OPTION:
            mode = Mode.Maximum_Poresize
        elif option == AVERAGE_PORESIZE_OPTION:
            mode = Mode.Average_Poresize
        elif option == PERMEABILITY_OPTION:
            mode = Mode.Permeability
        else:
            error_list.append("Invalid 'option' input")

    if error_list:
        return jsonify({"Error": error_list}), 400

    size_steps = db.getSizeSteps()

    try:
        bridge = Bridge.calculateBridgeDistribution(mode, value, size_steps)
    except Exception as e:
        return jsonify(e), 400

    response_dict = {"bridge": [round(num, ROUNDING_DECIMALS) for num in bridge]}

    return response_dict


# List handler. This function takes the HttpRequest
# object as input and returns a list of all available
# products. The returned products can be filtered based
# on all metadata categories. Likewise, any desired
# subset of the data can be returned.
def productListRequestHandler(filters, metadata_list):
    metadata = db.getMetadata()

    try:
        if filters:
            for filter in filters:
                filtered_key_list = []

                field = filter["metadata"]
                if field == SPELLING_ERROR:
                    include = filter["include"]
                    for id in metadata:
                        if metadata[id][SPELLING_ERROR].upper() not in include:
                            filtered_key_list.append(id)
                else:
                    try:
                        min_val = filter["min"]
                    except KeyError:
                        min_val = 0

                    try:
                        max_val = filter["max"]
                    except KeyError:
                        max_val = float('inf')

                    for id in metadata:
                        if (
                                float(metadata[id][field]) < min_val
                                or float(metadata[id][field]) > max_val
                        ):
                            filtered_key_list.append(id)

                for id in filtered_key_list:
                    del metadata[id]
    except Exception as e:
        return jsonify(e), 400

    return_list = []
    for id in metadata:
        data_dict = {
            "id": id,
            "name": metadata[id]["title"],
            "supplier": metadata[id]["supplier"],
            "sack_size": float(metadata[id]["sack_size"])
        }
        return_list.append(data_dict)

    return jsonify(return_list)


# Product handler. This function takes the HttpRequest
# object as input and returns data about a product based
# on its ID. The data returned can be filtered based on all
# metadata categories. as well as distribution and cumulative.
def productRequestHandler(product_id, metadata_list):
    if not product_id or not metadata_list:
        return "Id or metadata missing!", 400

    use_specific_metadata = True
    if not metadata_list:
        use_specific_metadata = False

    try:
        metadata = db.getMetadataFromID(product_id)
    except Exception as e:
        return "Invalid ID", 400

    data_dict = {}

    if use_specific_metadata:
        try:
            for key in metadata_list:
                if key == "DISTRIBUTION":
                    data_dict[key.lower()] = [
                        round(num, ROUNDING_DECIMALS) for num in db.getDistribution(product_id)
                    ]

                elif key == "CUMULATIVE":
                    data_dict[key.lower()] = [
                        round(num, ROUNDING_DECIMALS) for num in db.getCumulative(product_id)
                    ]

                elif key == "NAME":
                    data_dict[key.lower()] = metadata["TITLE"]

                else:
                    data_dict[key.lower()] = metadata[key]
        except ValueError:
            use_specific_metadata = False
        except TypeError:
            use_specific_metadata = False
        except KeyError:
            use_specific_metadata = False

    if not use_specific_metadata:
        for category in metadata:
            if category == "TITLE":
                data_dict["name"] = metadata[category]

            elif category != "Size_steps":
                data_dict[category.lower()] = metadata[category]

        data_dict["distribution"] = db.getDistribution(product_id)

    return data_dict


# Size step handler. This function takes the HttpRequest
# object as input and returns a list of the size steps.
def sizeStepsRequestHandler():
    return {"size_fractions": [round(num, ROUNDING_DECIMALS) for num in db.getSizeSteps()]}


# Optimizer handler. This function takes the HttpRequest
# object as input and returns the best combination of products
# aswell as the execution time, the fitness score and the
# amount of iterations.

# name, products, mass, weights, environmental
def optimizerRequestHandler(value, blend_name, products, mass_goal, weight_dict, environmental_list, option,
                            max_iterations, size_steps_filter):
    error_list = []

    if not products:
        products = []

        product_names = db.listProducts()

        for name in product_names:
            products.append(product_names[name])

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
        except KeyError:
            error_list.append("Invalid 'weights' input")
        except TypeError:
            error_list.append("Invalid 'weights' input")
        except ValueError:
            error_list.append("Invalid 'weights' input")

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

    mode = None

    if option == MAXIMUM_PORESIZE_OPTION:
        mode = Mode.Maximum_Poresize
    elif option == PERMEABILITY_OPTION:
        mode = Mode.Permeability
    elif option == AVERAGE_PORESIZE_OPTION:
        mode = Mode.Average_Poresize
    else:
        error_list.append("Invalid 'option' input")

    size_steps = db.getSizeSteps()

    if value:
        try:
            bridge = Bridge.calculateBridgeDistribution(mode, value, size_steps)
        except ValueError:
            error_list.append("Invalid 'value' input")
        except TypeError:
            error_list.append("Invalid 'value' input")
    else:
        error_list.append("Missing 'value' input")

    metadata = db.getMetadata()

    products = []

    for i in range(len(products)):
        id = str(products[i])

        try:
            product_dict = {
                "id": id,
                "cost": int(metadata[id]["COST"]),
                "CO2": int(metadata[id]["CO2"]),
                "sack_size": int(metadata[id]["SACK_SIZE"]),
                "enviromental": (metadata[id]["ENVIROMENTAL_IMPACT"]).upper(),
            }

            if environmental_list:
                if product_dict["enviromental"] in environmental_list:
                    product_dict["cumulative"] = db.getCumulative(id)
                    product_dict["distribution"] = db.getDistribution(id)
                    products.append(product_dict)

            else:
                product_dict["cumulative"] = db.getCumulative(id)
                product_dict["distribution"] = db.getDistribution(id)
                products.append(product_dict)

        except [TypeError, ValueError, KeyError]:
            error_list.append("Invalid 'id' input")

    if "Invalid 'weights' input" not in error_list:
        try:
            weights = [
                float(weight_dict["best_fit"]) / 100,
                float(weight_dict["cost"]) / 100,
                float(weight_dict["co2"]) / 100,
                float(weight_dict["mass_fit"]) / 100,
            ]
        except KeyError:
            error_list.append("Invalid 'weights' input")
        except TypeError:
            error_list.append("Invalid 'weights' input")

    if error_list:
        return jsonify({"Error": error_list})

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
            products,
            weights,
            bridge,
            mass_goal,
            getMaxAndMinValues(metadata),
            max_iterations,
            size_steps_filter,
        )
    except Exception as e:
        return f"Probably invalid inputs! {e}", 400

    mass_sum = 0
    products = []

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

    optimal_cumulative, optimal_distribution = Blend.calculateBlendDistribution(
        products, size_steps
    )

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

    return response_dict


# This function gets all the costs and CO2 values from the
# available poroducts, and returns the max and min value for both.
def getMaxAndMinValues(metadata):
    CO2_list = []
    Cost_list = []
    MaxAndMinList = []

    for key in metadata:
        Cost_list.append(int(metadata[key]["COST"]))
        CO2_list.append(int(metadata[key]["CO2"]))

    MaxAndMinList.append(max(Cost_list))
    MaxAndMinList.append(min(Cost_list))
    MaxAndMinList.append(max(CO2_list))
    MaxAndMinList.append(min(CO2_list))

    return MaxAndMinList
