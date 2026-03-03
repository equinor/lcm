import subprocess
import tempfile
from dataclasses import dataclass
from datetime import datetime

from plots.bridge import bridge_plot
from plots.evolution import evolution_plot
from plots.products_pie import products_pie


@dataclass
class Weighting:
    fit: int
    mass: int
    products: int
    cost: int | None
    co2: int | None
    environmental: int | None


@dataclass
class Report:
    score: float
    curve: list[float]
    pill_volume: int
    pill_density: int
    bridging_mode: str
    bridging_value: int
    total_mass: int
    products: dict
    weighting: Weighting
    email: str
    user: str

    @classmethod
    def from_request_dict(cls, request: dict) -> "Report":
        return cls(
            score=request["fitness"],
            curve=request["curve"],
            pill_volume=request["pillVolume"],
            pill_density=request["pillDensity"],
            bridging_mode=request["bridgingMode"],
            bridging_value=request["bridgingValue"],
            total_mass=request["totalMass"],
            products=request["products"],
            weighting=Weighting(
                request["weighting"]["bridge"],
                request["weighting"]["mass"],
                request["weighting"]["products"],
                None,
                None,
                None,
            ),
            email=request["email"],
            user=request["user"],
        )


def as_html(report: Report, pie_chart, bridge_graph, fitness_plot) -> str:
    date_stamp = datetime.now().strftime("%d.%m.%Y %H:%M")
    bridge_unit = "mD" if report.bridging_mode == "PERMEABILITY" else "microns"

    combinations = ""
    for p in report.products.values():
        combinations += f"""
        <tr>
            <td>{p["id"]}</td>
            <td>{p["value"]}</td>
            <td style='padding-left:50px;'>{round(p["percentage"], 2)}%</td>
        </tr>"""

    return f"""
<body>
    <h1>Lost Circulation Material - Blend Optimization</h1>
    <h5>Generated {date_stamp} by {report.user}</h5>
    <h4>Bridging based on: {report.bridging_mode}</h4>
    <h4>Bridging value: {report.bridging_value}{bridge_unit}</h4>
    <h4>Total mass: {report.total_mass}kg</h4>
    <h4>Weighting:</h4>
        <p>Bridge: {report.weighting.fit}</p>
        <p>Mass: {report.weighting.mass}</p>
        <p>Products: {report.weighting.products}</p>
        <p>Cost: {report.weighting.cost}</p>
        <p>Co2: {report.weighting.co2}</p>
        <p>Environmental: {report.weighting.environmental}</p>
    <h4>Optimal blend:</h4>
        <table>
            <tr>
                <th>Product</th>
                <th>kg/m3</th>
                <th>Percentage of blend</th>
            </tr>
            {combinations}
        </table>
    <img src="data:image/png;base64,{pie_chart}"/>
    <img src="data:image/png;base64,{bridge_graph}"/>
    <img src="data:image/png;base64,{fitness_plot}"/>
</body>"""


OUT_PDF = "/tmp/report.pdf"  # noqa: S108


def create_report(request: dict, bridge: bool = True):
    report = Report.from_request_dict(request)
    pie_chart = products_pie(report.products)
    bridge_graph = bridge_plot(report.products, report.bridging_mode, report.bridging_value) if bridge else ""
    fitness_plot = evolution_plot(report.curve)
    html = as_html(report, pie_chart, bridge_graph, fitness_plot)

    with tempfile.NamedTemporaryFile("w") as html_file:
        html_file.write(html)
        html_file.flush()
        try:
            subprocess.run(  # noqa: S602
                [f"pandoc {html_file.name} -f html -o {OUT_PDF}"],
                check=True,
                shell=True,
                capture_output=True,
            )
        except subprocess.CalledProcessError as ex:
            print(ex.stderr.decode())
            raise ex

    return OUT_PDF
