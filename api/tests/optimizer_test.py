import unittest
from typing import List

import matplotlib.pyplot as plt
import numpy as np
from matplotlib.ticker import ScalarFormatter

from calculators.bridge import SIZE_STEPS, theoretical_bridge
from calculators.optimizer import optimize
from util.enums import BridgeOption


def values_within_deviation(array: List, deviation: float):
    standard_deviation = np.std(array)
    mean = np.mean(array)
    for fit in array:
        if abs(fit - mean) > standard_deviation + deviation:
            raise ValueError(f"{fit} deviates too much from the mean {mean}")


class OptimizerTest(unittest.TestCase):
    @staticmethod
    @unittest.skip("Can't commit this test data set")
    def test_deviation():
        # TODO: Create a test_data_set that can be committed
        from products_data import product_data

        products = product_data
        mass = 3500
        max_iterations = 5000
        bridge = theoretical_bridge(BridgeOption.PERMEABILITY, 500)

        # Crate Matplotlib figure
        fig, (bridgeplot, alg_curve, mix_plot) = plt.subplots(3)
        fig.set_size_inches(9.4, 9.4)

        # Draw optimal bridge
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
        for i in range(1):
            result = optimize(products, bridge, mass, max_iterations)
            result["products"] = len(result["combination"])
            label = f"{i}-{round(result['score'], 1)}"
            bridgeplot.plot(SIZE_STEPS, result["cumulative_bridge"], label=label)
            alg_curve.plot(result["curve"], label=label)
            for prod in result["combination_progress"]:
                mix_plot.plot(prod)
            result_list.append(result)
            print(f"Execution time: {result_list[-1]['execution_time']} seconds")
            print(f"Number of products: {result['products']}")
            print(f"Combination: {result['combination']}")
            print(f"Fitness: {result_list[-1]['score']}")

        # Display plots
        bridgeplot.legend(loc="right", bbox_to_anchor=(1.13, 0.5))
        alg_curve.legend(loc="right", bbox_to_anchor=(1.13, 0.5))
        plt.subplots_adjust(right=0.9)
        plt.show()

        fitness = [run["score"] for run in result_list]
        values_within_deviation(fitness, 7)
