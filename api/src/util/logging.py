import logging


def init_logging():
    logger = logging.getLogger("API")
    if logger.hasHandlers():
        logger.handlers.clear()
    logger.setLevel(logging.INFO)
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter("%(levelname)s: %(asctime)s %(message)s"))
    logger.addHandler(handler)
    logger.info("Logger is configured")
