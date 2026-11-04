import logging
import os

from azure.monitor.opentelemetry import configure_azure_monitor
from flask import Flask
from opentelemetry.instrumentation.flask import FlaskInstrumentor

from config import config


def init_logging(flask_app: Flask):
    logger = logging.getLogger("API")
    if logger.hasHandlers():
        logger.handlers.clear()
    logger.setLevel(logging.INFO)
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter("%(levelname)s: %(asctime)s %(message)s"))
    logger.addHandler(handler)
    if os.getenv("FLASK_DEBUG") is not None:
        logger.info("FLASK_DEBUG is set, Application Insights is disabled")
    elif not config.APPINSIGHTS_CON_STRING:
        logger.warning("APPINSIGHTS_CON_STRING is not set, Application Insights is disabled")
    else:
        FlaskInstrumentor.instrument_app(flask_app)
        configure_azure_monitor(connection_string=config.APPINSIGHTS_CON_STRING, logger_name="API")

    logger.info("Logger is configured")
