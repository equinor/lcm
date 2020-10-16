import logging

import connexion
from azure.common import AzureMissingResourceHttpError
from flask import abort, jsonify, request, Response
from flask_cors import CORS

from calculators import Blend, Bridge
from config import Config
from controllers.optimizer import optimizerRequestHandler
from controllers.products import products_get
from util import DatabaseOperations as db
from util.authentication import authorize
from util.Classes import Mode, Product
from util.load_data import sync_all

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


def init_api():
    connexion_app = connexion.App(__name__, specification_dir="./openapi/")

    CORS(connexion_app.app)

    flask_app = connexion_app.app
    flask_app.config.from_object(Config)

    connexion_app.add_api("api.yaml", arguments={"title": "files"})

    return connexion_app.app


app = init_api()


@app.route("/api/products", methods=["GET"])
@authorize
def products():
    return jsonify(products_get())


@app.route("/api/sync", methods=["POST"])
@authorize
def sync_sharepoint():
    try:
        sync_all()
    except Exception as error:
        return Response(str(error), 500)
    return "ok"


@app.route("/api", methods=["GET", "POST"])
@authorize
def main():
    logging.info("Python HTTP trigger function processed a request.")
    if not request.json:
        abort(400, "No data was send with the request")

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

        return optimizerRequestHandler(
            value,
            name,
            products,
            mass,
            weights,
            environmental,
            option,
            iterations,
            size_step,
        )

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
    missing_products = []
    percent_sum = 0

    try:
        for product in products:
            if not product.get("percentage"):
                return f"Product {product['id']} is missing percentage!", 400
            percent_sum += product["percentage"]

            try:
                cumulative = db.getCumulative(product["id"])
                distribution = db.getCumulative(product["id"])
            except AzureMissingResourceHttpError as e:
                print(e)
                missing_products.append(product["id"])
                continue

            product_list.append(
                Product(
                    product["id"],
                    "",
                    float(product["percentage"]) / 100.0,
                    cumulative,
                    distribution,
                )
            )

        percent_sum = int(round(percent_sum))

        if percent_sum != 100:
            abort(400, "The sum of percentages does not add up to 100")

    except Exception as e:
        print(e)
        return jsonify(e), 400

    size_steps = db.getSizeSteps()
    try:
        cumulative, distribution = Blend.calculateBlendDistribution(product_list, size_steps)
    except Exception as e:
        return jsonify(e), 400

    response_dict = {
        "cumulative": [round(num, ROUNDING_DECIMALS) for num in cumulative],
        "distribution": [round(num, ROUNDING_DECIMALS) for num in distribution],
        "missing": missing_products,
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
                    data_dict[key.lower()] = [round(num, ROUNDING_DECIMALS) for num in db.getDistribution(product_id)]

                elif key == "CUMULATIVE":
                    data_dict[key.lower()] = [round(num, ROUNDING_DECIMALS) for num in db.getCumulative(product_id)]

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


# This function gets all the costs and CO2 values from the
# available poroducts, and returns the max and min value for both.
