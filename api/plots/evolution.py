import base64
from io import BytesIO
from typing import List

import matplotlib.pyplot as plt
from matplotlib.ticker import ScalarFormatter


def evolution_plot(progress: List[float]) -> str:
    # Crate Matplotlib figure
    fig, ax = plt.subplots()

    ax.set_title("Evolution")
    ax.set_xlabel("Generation")
    ax.set_ylabel("Fitness score")
    ax.xaxis.set_major_formatter(ScalarFormatter())
    ax.plot(progress, color="black")
    plt.tight_layout()

    tmpfile = BytesIO()
    fig.savefig(tmpfile, format="png")
    encoded = base64.b64encode(tmpfile.getvalue()).decode("utf-8")
    return encoded
