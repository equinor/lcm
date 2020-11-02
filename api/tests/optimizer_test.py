import unittest
from typing import List

import matplotlib.pyplot as plt
import numpy as np
from matplotlib.ticker import ScalarFormatter

from calculators.bridge import SIZE_STEPS, theoretical_bridge
from calculators.optimizer import optimize
from products_data import product_data
from util.enums import BridgeOption


def values_within_deviation(array: List, deviation: float):
    standard_deviation = np.std(array)
    mean = np.mean(array)
    for fit in array:
        if abs(fit - mean) > standard_deviation + deviation:
            raise ValueError(f"{fit} deviates too much from the mean {mean}")


class OptimizerTest(unittest.TestCase):
    @staticmethod
    def test_deviation():
        products = product_data
        mass = 3500
        max_iterations = 100
        bridge = theoretical_bridge(BridgeOption.PERMEABILITY, 500)

        fig, (bridgeplot, alg_curve) = plt.subplots(2)
        fig.set_size_inches(9.4, 9.4)

        bridgeplot.set_title("Bridges")
        bridgeplot.set_xscale("log")
        bridgeplot.set_xlabel("Particle Size μm")
        bridgeplot.set_ylabel("Accumulated volume %")
        bridgeplot.set_xticks([0.1, 1, 10, 100, 1000])
        bridgeplot.xaxis.set_major_formatter(ScalarFormatter())
        bridgeplot.plot(SIZE_STEPS, bridge, color="black", label="ideal")

        alg_curve.set_title("Gen.Alg. Evolution")
        alg_curve.set_xlabel("Generations")
        alg_curve.set_ylabel("Fitness %")

        result_list = []
        for i in range(5):
            result = optimize(products, bridge, mass, max_iterations)
            label = f"{i}-{round(result['score'],1)}"
            bridgeplot.plot(SIZE_STEPS, result["cumulative_bridge"], label=label)
            alg_curve.plot(result["curve"], label=label)
            result_list.append(result)
            print(f"Execution time: {result_list[-1]['execution_time']} seconds")
            print(f"Fitness: {result_list[-1]['score']}")

        bridgeplot.legend(loc="right", bbox_to_anchor=(1.13, 0.5))
        alg_curve.legend(loc="right", bbox_to_anchor=(1.13, 0.5))
        plt.subplots_adjust(right=0.9)
        plt.show()

        fitness = [run["score"] for run in result_list]
        values_within_deviation(fitness, 7)
