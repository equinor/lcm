import logging
import os

from azure.monitor.opentelemetry import configure_azure_monitor
from flask import Flask
from opentelemetry.instrumentation.flask import FlaskInstrumentor

from config import Config


def init_logging(flask_app: Flask):
    logger = logging.getLogger("API")
    if logger.hasHandlers():
        logger.handlers.clear()
    logger.setLevel(logging.INFO)
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter("%(levelname)s: %(asctime)s %(message)s"))
    logger.addHandler(handler)
    if os.getenv("FLASK_DEBUG") is None:
        FlaskInstrumentor.instrument_app(flask_app)
        configure_azure_monitor(connection_string=Config.APPINSIGHTS_CON_STRING, logger_name="API")

    logger.info("Logger is configured")
