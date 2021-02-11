from flask import Response

from calculators.bridge import theoretical_bridge


def bridgeRequestHandler(option: str, value: int):
    if not value or not option:
        return Response("No options or value given!", 400)
    bridge = theoretical_bridge(option, value)
    response_dict = {"bridge": [round(num, 1) for num in bridge]}
    return response_dict
