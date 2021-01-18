import base64
from io import BytesIO

import matplotlib.pyplot as plt
from matplotlib.ticker import ScalarFormatter

from calculators.bridge import calculate_blend_cumulative, SIZE_STEPS, theoretical_bridge
from classes.product import Product
from controllers.products import products_get


def bridge_plot(products: dict, mode, value) -> str:
    bridge = theoretical_bridge(mode, value)

    (
        fig,
        bridgeplot,
    ) = plt.subplots()
    bridgeplot.set_title("Bridge")
    bridgeplot.set_xscale("log")
    bridgeplot.set_xlabel("Particle Size μm")
    bridgeplot.set_ylabel("Accumulated volume %")
    bridgeplot.set_xticks([0.1, 1, 10, 100, 1000])
    bridgeplot.xaxis.set_major_formatter(ScalarFormatter())
    bridgeplot.plot(SIZE_STEPS, bridge, color="black", label="Ideal")
    bridgeplot.axes.set_ylim([0, 100])
    bridgeplot.axes.set_xlim([0.01, 10000])

    products_class = []
    all_products = products_get()
    for id, values in products.items():
        products_class.append(
            Product(product_id=id, share=(values["percentage"] / 100), cumulative=all_products[id]["cumulative"])
        )
    bridgeplot.plot(SIZE_STEPS, calculate_blend_cumulative(products_class), color="red", label="Blend")

    bridgeplot.legend()

    tmpfile = BytesIO()
    fig.savefig(tmpfile, format="png")
    encoded = base64.b64encode(tmpfile.getvalue()).decode("utf-8")
    return encoded
