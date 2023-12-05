import base64
from io import BytesIO

import matplotlib.pyplot as plt

COLORS = [
    "#8C1159",
    "#52C0FF",
    "#00977B",
    "#0084C4",
    "#005F57",
    "#E24973",
    "#FF92A8",
    "#40D38F",
    "#004088",
    "#ee2e89",
    "#21d0bb",
    "#2077d9",
    "#a1022f",
    "#2bcb95",
    "#64b3ec",
    "#ef7895",
    "#02953d",
    "#044f78",
]


def products_pie(products: dict) -> str:
    product_names = [p["id"] for p in products.values()]
    product_values = [p["value"] for p in products.values()]

    fig, ax = plt.subplots()
    ax.set_title("Product distribution in blend")

    wedges, text, auto_texts = ax.pie(
        product_values,
        autopct="%1.1f%%",
        startangle=90,
        wedgeprops={"edgecolor": "w", "linewidth": 1, "width": 0.3},
        colors=COLORS,
    )
    ax.legend(wedges, product_names, title="Products", loc="center left", bbox_to_anchor=(0.92, 0.3, 0, 1))
    tmpfile = BytesIO()
    fig.savefig(tmpfile, format="png")
    encoded = base64.b64encode(tmpfile.getvalue()).decode("utf-8")
    return encoded
