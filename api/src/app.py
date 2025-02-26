import logging
import os
import traceback

from flask import Flask, Response, request, send_file

from calculators.bridge import SIZE_STEPS
from config import Config
from controllers.combination import bridge_from_combination
from controllers.optimal_bridge import bridgeRequestHandler
from controllers.optimizer import optimizer_request_handler
from controllers.products import products_get
from controllers.report import create_report
from util.authentication import authorize
from util.sync_share_point_az import sync_all

from opentelemetry.instrumentation.flask import FlaskInstrumentor
from azure.monitor.opentelemetry import configure_azure_monitor

APPINSIGHTS_CONSTRING="InstrumentationKey=a87d0118-2cee-4e7b-814e-e2579059aa3a;IngestionEndpoint=https://norwayeast-0.in.applicationinsights.azure.com/;LiveEndpoint=https://norwayeast.livediagnostics.monitor.azure.com/;ApplicationId=0f27fd28-c81c-4064-ae41-d4a0e377d7ae"
def init_logging():
    try:
        logger = logging.getLogger("API")
        if logger.hasHandlers():
            logger.handlers.clear()
        logger.setLevel("INFO")
        formatter = logging.Formatter("%(levelname)s:%(asctime)s %(message)s")
        handler = logging.StreamHandler()
        handler.setFormatter(formatter)
        handler.setLevel("INFO")
        logger.addHandler(handler)
        logger.info("Logger is configured")
    except Exception as e:
        print("init logging")
        traceback.print_exc()

def init_api():
    flask_app = Flask(__name__)
    flask_app.config.from_object(Config)
    init_logging()
    if os.getenv("FLASK_DEBUG") is None:
        FlaskInstrumentor.instrument_app(flask_app)
        configure_azure_monitor(connection_string=APPINSIGHTS_CONSTRING, logger_name="API")
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
    return bridgeRequestHandler(request.json.get("option"), int(request.json.get("value")))


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
    density = request.json.get("density")
    volume = request.json.get("volume")
    option = request.json.get("option")
    iterations = request.json.get("iterations")
    max_products = request.json.get("maxProducts")
    particle_range = request.json.get("particleRange")
    weights = request.json.get("weights")

    return optimizer_request_handler(
        value, name, products, density, volume, option, iterations, max_products, particle_range, weights
    )
