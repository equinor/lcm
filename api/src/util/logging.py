import logging


def init_logging():
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
