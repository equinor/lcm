import unittest
from pathlib import Path

from config import Config
from controllers.report import create_report

request = {
    "fitness": 4.4,
    "pillVolume": 10,
    "pillDensity": 350,
    "bridgingMode": "PERMEABILITY",
    "bridgingValue": 500,
    "weighting": {"bridge": 5, "cost": 5, "co2": 5, "environmental": 5},
    "products": {
        "b": {"id": "baracarb150", "value": 45, "percentage": 12},
        "c": {"id": "supercom", "value": 88, "percentage": 12},
        "d": {"id": "compound-V", "value": 77, "percentage": 12},
        "e": {"id": "tight-seal", "value": 5, "percentage": 12},
        "f": {"id": "tighterfit", "value": 6, "percentage": 12},
        "g": {"id": "Compund-B", "value": 56, "percentage": 12},
    },
    "totalMass": 3500,
}


class ReportTest(unittest.TestCase):
    @staticmethod
    def test_create_report():
        create_report(request, bridge=False)
        result = Path(f"{Config.HOME_DIR}/report.pdf")
        # Check if file was created
        assert result.is_file()
        # Check that file has a minimum size of 30KB
        assert result.stat().st_size > 30000
