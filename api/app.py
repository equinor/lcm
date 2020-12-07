import traceback

from flask import Flask, request, Response, send_file

from calculators.bridge import SIZE_STEPS
from config import Config
from controllers.combination import bridge_from_combination
from controllers.optimal_bridge import bridgeRequestHandler
from controllers.optimizer import optimizer_request_handler
from controllers.products import products_get
from controllers.report import create_report
from util.authentication import authorize
from util.sync_share_point_az import sync_all


def init_api():
    flask_app = Flask(__name__)
    flask_app.config.from_object(Config)
    return flask_app


app = init_api()


@app.route("/api/products", methods=["GET"])
@authorize
def products():
    return products_get()


@app.route("/api/report", methods=["POST"])
@authorize
def report():
    return send_file(create_report(request.json), mimetype="application/pdf")


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
        traceback.print_exc()
        return Response(str(error), 500)
    return "ok"


@app.route("/api/fractions", methods=["GET"])
@authorize
def size_fractions():
    return {"size_fractions": SIZE_STEPS}


@app.route("/api/optimizer", methods=["POST"])
@authorize
def main():
    value = request.json.get("value")
    name = request.json.get("name")
    products = request.json.get("products")
    mass = request.json.get("mass")
    option = request.json.get("option")
    iterations = request.json.get("iterations")
    max_products = request.json.get("maxProducts")
    particle_range = request.json.get("particleRange")
    weights = request.json.get("weights")

    return optimizer_request_handler(
        value, name, products, mass, option, iterations, max_products, particle_range, weights
    )
