from datetime import datetime
from typing import Dict

import pypandoc

from config import Config
from plots.bridge import bridge_plot
from plots.products_pie import products_pie


class Weighting:
    def __init__(self, fit: int, cost: int, co2: int, environmental: str):
        self.fit = fit
        self.cost = cost
        self.co2 = co2
        self.environmental = environmental


class Report:
    score: float = None
    pill_volume: int = None
    pill_density: int = None
    bridging_mode: str = None
    bridging_value: int = None
    total_mass: int = None
    products: dict = None
    weighting: Weighting = None

    @classmethod
    def from_dict(cls, _dict: Dict):
        instance = cls()
        instance.score = _dict["fitness"]
        instance.pill_volume = _dict["pillVolume"]
        instance.pill_density = _dict["pillDensity"]
        instance.bridging_mode = _dict["bridgingMode"]
        instance.bridging_value = _dict["bridgingValue"]
        instance.total_mass = _dict["totalMass"]
        instance.products = _dict["products"]
        instance.weighting = Weighting(
            _dict["weighting"]["bridge"],
            _dict["weighting"]["cost"],
            _dict["weighting"]["co2"],
            _dict["weighting"]["environmental"],
        )

        return instance


def as_html(report: Report, pie_chart, bridge_graph) -> str:
    date_stamp = datetime.now().strftime("%d.%m.%Y %H:%M")
    bridge_unit = "mD" if report.bridging_mode == "PERMEABILITY" else "microns"

    combinations = ""
    for p in report.products.values():
        combinations += f"""<tr>
            <td>{p['id']}</td>
            <td>{p['value']}</td>
            <td style='padding-left:50px;'>{round(p['percentage'], 2)}%</td>
        </tr>"""

    return f"""
<body>
    <h1>Lost Circulation Material - Blend Optimization</h1>
    <h5>Generated {date_stamp}</h5>
    <h4>Bridging based on: {report.bridging_mode}</h4>
    <h4>Bridging value: {report.bridging_value}{bridge_unit}</h4>
    <h4>Total mass: {report.total_mass}kg</h4>
    <h4>Weighting:</h4>
        <label>Bridge: {report.weighting.fit}</label>
    <h4>Optimal blend:</h4>
        <table>
            <tr>
                <th>Product</th>
                <th>Sacks</th>
                <th>Percentage of blend</th>
            </tr>
            {combinations}
        </table>
    <img src="data:image/png;base64,{pie_chart}"/>
    <img src="data:image/png;base64,{bridge_graph}"/>
</body>"""


def create_report(request: Dict, bridge: bool = True):
    report: Report = Report().from_dict(request)
    pie_chart = products_pie(report.products)
    bridge_graph = bridge_plot(report.products, report.bridging_mode, report.bridging_value) if bridge else ""
    html = as_html(report, pie_chart, bridge_graph)
    with open(f"{Config.HOME_DIR}/report.html", "w") as report_html:
        report_html.write(html)
    pypandoc.convert_file(
        f"{Config.HOME_DIR}/report.html",
        "pdf",
        format="html",
        outputfile=f"{Config.HOME_DIR}/report.pdf",
        extra_args=["--to", "html", "--css", f"{Config.HOME_DIR}/util/report.css"],
    )
