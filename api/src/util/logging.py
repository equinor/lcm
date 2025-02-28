import logging
import traceback


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
    except (ValueError, TypeError) as e:
        logging.error("Failed to configure logger: %s", e)
        logging.error(traceback.format_exc())
    except Exception as e:
        logging.error("An unexpected error occurred during logging initialization: %s", e)
        logging.error(traceback.format_exc())
