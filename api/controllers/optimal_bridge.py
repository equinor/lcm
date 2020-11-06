from flask import Response

from calculators.bridge import theoretical_bridge
from util.enums import bridge_mode_int


def bridgeRequestHandler(option: str, value: int):
    if not value or not option:
        return Response("No options or value given!", 400)
    mode = bridge_mode_int(option)
    bridge = theoretical_bridge(mode, value)
    response_dict = {"bridge": [round(num, 2) for num in bridge]}
    return response_dict
