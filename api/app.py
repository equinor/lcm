# This module is triggered by an HTTP request from the front-end.
# Based on the request body, the correct data are then returned
# from either the database or the data layer.

import logging
import json
from flask import Flask, jsonify, request, abort, Response

from util import DatabaseOperations as db
from util.Classes import Product, Mode
from calculators import Blend, Bridge, Optimizer
from util.load_test_data import moveDataFromBlobToTable

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

@app.cli.command()
def load_test_data_to_tabel():
    moveDataFromBlobToTable()

@app.route('/')
def main(req):
    logging.info("Python HTTP trigger function processed a request.")

    request = req.params.get("request")
    if not request:
        try:
            req_body = req.get_json()
        except ValueError:
            abort(400)
        else:
            request = req_body.get("request")

    if request == BLEND_REQUEST:
        return blendRequestHandler(req)

    elif request == BRIDGE_REQUEST:
        return bridgeRequestHandler(req)

    elif request == OPTIMIZER_REQUEST:
        return optimizerRequestHandler(req)

    elif request == PRODUCT_LIST_REQUEST:
        return productListRequestHandler(req)

    elif request == PRODUCT_ID_REQUEST:
        return productRequestHandler(req)

    elif request == SIZE_STEPS_REQUEST:
        return sizeStepsRequestHandler(req)

    elif request:
        abort(400)

    else:
        abort(400)


# Blend handler. This function takes the HttpRequest
# object as input and returns the cumulative distribution
# of a blend, based on the given input data.
def blendRequestHandler(req):
    products = req.params.get("products")
    if not products:
        try:
            req_body = req.get_json()
        except ValueError:
            abort(400)
        else:
            products = req_body.get("products")

    product_list = []
    percent_sum = 0

    try:
        for product in products:
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

        if percent_sum != 100:
            abort(400)

    except Exception as e:
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
def bridgeRequestHandler(req):
    error_list = []
    option = req.params.get("option")
    if not option:
        try:
            req_body = req.get_json()
        except ValueError:
            abort(400)
        else:
            option = req_body.get("option")

    value = req.params.get("value")
    if not value:
        try:
            req_body = req.get_json()
        except ValueError:
            abort(400)
        else:
            value = req_body.get("value")

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
    else:
        error_list.append("Missing 'option' input")

    if not value:
        error_list.append("Missing 'value' input")

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
def productListRequestHandler(req):
    filters = req.params.get("filters")
    if not filters:
        try:
            req_body = req.get_json()
        except ValueError:
            abort(400)
        else:
            filters = req_body.get("filters")

    metadata_list = req.params.get("metadata")
    if not metadata_list:
        try:
            req_body = req.get_json()
        except ValueError:
            abort(400)
        else:
            metadata_list = req_body.get("metadata")

    use_specific_metadata = True
    if not metadata_list:
        use_specific_metadata = False

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

    if use_specific_metadata:
        try:
            for id in metadata:
                data_dict = {
                    "id": id,
                    "name": metadata[id]["TITLE"],
                    "supplier": metadata[id]["SUPPLIER"],
                }

                for key in metadata_list:
                    if key == "DISTRIBUTION":
                        data_dict[key.lower()] = [
                            round(num, ROUNDING_DECIMALS) for num in db.getDistribution(id)
                        ]
                    elif key == "CUMULATIVE":
                        data_dict[key.lower()] = [
                            round(num, ROUNDING_DECIMALS) for num in db.getCumulative(id)
                        ]
                    elif (key != "TITLE") and (key != "NAME") and (key != "ID"):
                        data_dict[key.lower()] = metadata[id][key]

                return_list.append(data_dict)
        except TypeError:
            use_specific_metadata = False
        except KeyError:
            use_specific_metadata = False
        except ValueError:
            use_specific_metadata = False

    if not use_specific_metadata:
        return_list = []
        for id in metadata:
            data_dict = {
                "id": id,
                "name": metadata[id]["TITLE"],
                "supplier": metadata[id]["SUPPLIER"],
            }
            return_list.append(data_dict)

    return return_list


# Product handler. This function takes the HttpRequest
# object as input and returns data about a product based
# on its ID. The data returned can be filtered based on all
# metadata categories. as well as distribution and cumulative.
def productRequestHandler(req):
    product_id = req.params.get("id")
    if not product_id:
        try:
            req_body = req.get_json()
        except ValueError:
            abort(400)
        else:
            product_id = req_body.get("id")

    metadata_list = req.params.get("metadata")
    if not metadata_list:
        try:
            req_body = req.get_json()
        except ValueError:
            abort(400)
        else:
            metadata_list = req_body.get("metadata")

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

    return func.HttpResponse(body=json.dumps(data_dict))


# Size step handler. This function takes the HttpRequest
# object as input and returns a list of the size steps.
def sizeStepsRequestHandler(req):
    response_dict = {"size_fractions": [round(num, ROUNDING_DECIMALS) for num in db.getSizeSteps()]}

    return response_dict


# Optimizer handler. This function takes the HttpRequest
# object as input and returns the best combination of products
# aswell as the execution time, the fitness score and the
# amount of iterations.
def optimizerRequestHandler(req):
    error_list = []
    blend_name = req.params.get("name")
    if not blend_name:
        try:
            req_body = req.get_json()
        except ValueError:
            abort(400)
        else:
            blend_name = req_body.get("name")
    if not blend_name:
        error_list.append("Missing 'name' input")

    product_list = req.params.get("products")
    if not product_list:
        try:
            req_body = req.get_json()
        except ValueError:
            abort(400)
        else:
            product_list = req_body.get("products")
    if not product_list:
        product_list = []

        product_names = db.listProducts()

        for name in product_names:
            product_list.append(product_names[name])

    mass_goal = req.params.get("mass")
    if not mass_goal:
        try:
            req_body = req.get_json()
        except ValueError:
            abort(400)
        else:
            mass_goal = req_body.get("mass")
    if not mass_goal:
        error_list.append("Missing 'mass' input")

    weight_dict = req.params.get("weights")
    if not weight_dict:
        try:
            req_body = req.get_json()
        except ValueError:
            abort(400)
        else:
            weight_dict = req_body.get("weights")
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

    enviromental_list = req.params.get("enviromental")
    if not enviromental_list:
        try:
            req_body = req.get_json()
        except ValueError:
            abort(400)
        else:
            enviromental_list = req_body.get("enviromental")

    option = req.params.get("option")
    if not option:
        try:
            req_body = req.get_json()
        except ValueError:
            abort(400)
        else:
            option = req_body.get("option")
    if not option:
        option = AVERAGE_PORESIZE_OPTION

    max_iterations = req.params.get("max_iterations")
    if not max_iterations:
        try:
            req_body = req.get_json()
        except ValueError:
            abort(400)
        else:
            max_iterations = req_body.get("max_iterations")
    if not max_iterations:
        max_iterations = DEFAULT_MAX_ITERATIONS
    if max_iterations < 0:
        max_iterations = 0

    size_steps_filter = req.params.get("size_steps_filter")
    if not size_steps_filter:
        try:
            req_body = req.get_json()
        except ValueError:
            abort(400)
        else:
            size_steps_filter = req_body.get("size_steps_filter")
    if (not size_steps_filter) or (size_steps_filter < 0):
        size_steps_filter = 0
    elif size_steps_filter > 1:
        size_steps_filter = 1

    value = req.params.get("value")
    if not value:
        try:
            req_body = req.get_json()
        except ValueError:
            abort(400)
        else:
            value = req_body.get("value")

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

    for i in range(len(product_list)):
        id = str(product_list[i])

        try:
            product_dict = {
                "id": id,
                "cost": int(metadata[id]["COST"]),
                "CO2": int(metadata[id]["CO2"]),
                "sack_size": int(metadata[id]["SACK_SIZE"]),
                "enviromental": (metadata[id]["ENVIROMENTAL_IMPACT"]).upper(),
            }

            if enviromental_list:
                if product_dict["enviromental"] in enviromental_list:
                    product_dict["cumulative"] = db.getCumulative(id)
                    product_dict["distribution"] = db.getDistribution(id)
                    products.append(product_dict)

            else:
                product_dict["cumulative"] = db.getCumulative(id)
                product_dict["distribution"] = db.getDistribution(id)
                products.append(product_dict)

        except TypeError:
            error_list.append("Invalid 'id' input")
        except ValueError:
            error_list.append("Invalid 'id' input")
        except KeyError:
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
    product_list = []

    for product in products:
        product["mass"] = int(best[product["id"]]) * product["sack_size"]
        mass_sum += product["mass"]

    for product in products:
        product_list.append(
            Product(
                product["id"],
                "",
                float(product["mass"]) / mass_sum,
                product["cumulative"],
                product["distribution"],
            )
        )

    optimal_cumulative, optimal_distribution = Blend.calculateBlendDistribution(
        product_list, size_steps
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


if __name__ == '__main__':
    main()
