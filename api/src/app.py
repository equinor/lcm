import os

from azure.monitor.opentelemetry import configure_azure_monitor
from flask import Flask, request, send_file
from opentelemetry.instrumentation.flask import FlaskInstrumentor

import util.logging as logging
from calculators.bridge import SIZE_STEPS
from config import Config
from use_cases.bridge_from_combination import bridge_from_combination
from use_cases.calculate_optimal_bridge import calculate_optimal_bridge
from use_cases.create_report import create_report
from use_cases.get_products import get_products
from use_cases.run_optimizer import run_optimizer
from use_cases.synchronize_with_sharepoint import synchronize_with_sharepoint
from util.authentication import authorize
from util.exception_handling import handle_exceptions
from util.utils import convert_keys_camel_to_underscore, convert_keys_underscore_to_camel


def init_api():
    flask_app = Flask(__name__)
    flask_app.config.from_object(Config)
    logging.init_logging()
    if os.getenv("FLASK_DEBUG") is None:
        FlaskInstrumentor.instrument_app(flask_app)
        configure_azure_monitor(connection_string=Config.APPINSIGHTS_CON_STRING, logger_name="API")
    return flask_app


app = init_api()


@app.route("/api/products", methods=["GET"])
@authorize
@handle_exceptions
def products():
    return get_products()


@app.route("/api/report", methods=["POST"])
@authorize
@handle_exceptions
def report():
    return send_file(create_report(request.json), mimetype="application/pdf")


@app.route("/api/combination", methods=["POST"])
@authorize
@handle_exceptions
def combination():
    return bridge_from_combination(request.json)


@app.route("/api/bridge", methods=["POST"])
@authorize
@handle_exceptions
def bridge():
    return calculate_optimal_bridge(request.json.get("option"), int(request.json.get("value")))


@app.route("/api/sync", methods=["POST"])
@authorize
@handle_exceptions
def sync_sharepoint():
    return synchronize_with_sharepoint()


@app.route("/api/fractions", methods=["GET"])
@authorize
@handle_exceptions
def size_fractions():
    return {"size_fractions": SIZE_STEPS}


@app.route("/api/optimizer", methods=["POST"])
@authorize
@handle_exceptions
def optimizer():
    response_dict = run_optimizer(convert_keys_camel_to_underscore(request.json))
    return convert_keys_underscore_to_camel(response_dict)
