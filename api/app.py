import connexion
from flask import jsonify, request, Response, send_file
from flask_cors import CORS

from calculators.bridge import SIZE_STEPS
from config import Config
from controllers.combination import bridge_from_combination
from controllers.optimal_bridge import bridgeRequestHandler
from controllers.optimizer import optimizerRequestHandler
from controllers.products import products_get
from controllers.report import create_report
from util.authentication import authorize
from util.sync_share_point_az import sync_all


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


@app.route("/api/report", methods=["POST"])
@authorize
def report():
    create_report(request.json)
    return send_file(f"{Config.HOME_DIR}/report.pdf", mimetype="application/pdf")


@app.route("/api/combination", methods=["POST"])
@authorize
def combination():
    return bridge_from_combination(request.json)


@app.route("/api/bridge", methods=["POST"])
@authorize
def bridge():
    return bridgeRequestHandler(request.json.get("option"), request.json.get("value"))


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
    req = request.json.get("request")
    if req == "OPTIMAL_MIX":
        value = request.json.get("value")
        name = request.json.get("name")
        products = request.json.get("products")
        mass = request.json.get("mass")
        option = request.json.get("option")
        iterations = request.json.get("iterations")
        max_products = request.json.get("maxProducts")

        return optimizerRequestHandler(value, name, products, mass, option, iterations, max_products)

    elif req == "SIZE_FRACTIONS":
        return size_steps_handler()


def size_steps_handler():
    return {"size_fractions": SIZE_STEPS}
