from flask import Response

from calculators.bridge import theoretical_bridge


def calculate_optimal_bridge(option: str, value: int):
    if not value or not option:
        return Response("No options or value given!", 400)
    bridge = theoretical_bridge(option, value)
    return {"bridge": [round(num, 1) for num in bridge]}
