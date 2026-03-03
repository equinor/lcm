import functools
import logging

from flask import Response

from util.exceptions import InternalErrorException, ValidationException


def handle_exceptions(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except ValidationException as e:
            return Response(f"Validation error: {e.message}", status=400)
        except InternalErrorException as e:
            return Response(f"Internal error: {e.message}", status=500)
        except Exception as e:
            logging.getLogger("API").exception("Unexpected error occurred", exc_info=e)
            return Response("Internal error: An unexpected error occurred", status=500)

    return wrapper
