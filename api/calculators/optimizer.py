import pickle  # nosec
import random
from datetime import datetime
from typing import List

import numpy as np

from calculators.bridge import calculate_blend_cumulative, SIZE_STEPS
from classes.product import Product
from cachetools import cached, LFUCache


class Optimizer:
    POPULATION_SIZE = 20
    NUMBER_OF_CHILDREN = 18  # must be a multitude of 2
    NUMBER_OF_PARENTS = 2
    MUTATION_PROBABILITY = 50  # percent
    NUMBER_OF_MUTATIONS = 30
    MIN_MUTATOR_VALUE = 5
    ENVIRONMENTAL_SCORE = {
        "GREEN": 100,
        "YELLOW": 66,
        "RED": 33,
        "BLACK": 0,
    }
    MASS_IMPORTANCE = 100  # %dev/MASS_IMPORTANCE (less is more)
    NUMBER_OF_PRODUCTS_IMPORTANCE = 500  # %deviation/importance (less is more)

    def __init__(
        self,
        products: List[dict],
        bridge: List[float],
        mass_goal: int,
        max_iterations: int = 500,
        max_products: int = 999,
        particle_range=None,
    ):
        self.products = products
        self.bridge = bridge
        self.mass_goal = mass_goal
        self.max_iterations = max_iterations
        self.max_products = max_products
        if particle_range is None:
            particle_range = [1.0, 100]
        if particle_range[1] <= 0:
            particle_range[1] = 10000
        self.particle_range = particle_range

    def optimize(self):
        start = datetime.now()
        max_number_of_sacks = (
            self.mass_goal // (self.average_sack_size() * min(self.max_products, len(self.products)))
        ) * 2

        score_progress = []
        population, children = self.initialize_population(max_number_of_sacks)
        iterations = 0
        fittest_combo, score, experimental_bridge = {}, 100, []
        for _ in range(self.max_iterations):
            parents = self.select_parents(population)
            children = self.crossover(parents, children)
            children = self.execute_mutation(children)
            population = parents + children
            score, fittest_combo, experimental_bridge = self.optimal(population)
            # for i, _ in enumerate(products):
            #     combination_progress[i].append(list(fittest_combo.values())[i])
            score_progress.append(score)

        return {
            "combination": {k: v for k, v in fittest_combo.items() if v > 0},
            "cumulative_bridge": experimental_bridge,
            "curve": score_progress,
            "execution_time": (datetime.now() - start),
            "iterations": iterations,
            "score": score,
        }

    def initialize_population(self, max_number_of_sacks):
        population = []
        children = []

        if self.max_products < len(self.products):
            id_list = [p["id"] for p in self.products]

            for _ in range(self.POPULATION_SIZE):
                combo_dict = {id: 0 for id in id_list}
                used_id_list = []

                for _ in range(self.max_products):
                    id = random.choice(id_list)
                    while id in used_id_list:
                        id = random.choice(id_list)
                    used_id_list.append(id)

                for id in used_id_list:
                    combo_dict[id] = random.randint(0, max_number_of_sacks)

                population.append(combo_dict)

        else:
            for i in range(self.POPULATION_SIZE):
                combo_dict = {}
                for j in range(len(self.products)):
                    combo_dict[self.products[j]["id"]] = random.randint(0, max_number_of_sacks)
                population.append(combo_dict)

        for i in range(self.NUMBER_OF_CHILDREN):
            children.append([])

        return population, children

    def average_sack_size(self):
        return sum([p["sack_size"] for p in self.products]) / len(self.products)

    def select_parents(self, population):
        fitness = []
        fit_dict = {}

        for combination in population:
            score, _ = self.fitness_score(pickle.dumps(combination))
            fitness.append(score)
            fit_dict[score] = combination

        fitness.sort()

        parents = [fit_dict[fitness[0]], fit_dict[fitness[1]]]

        return parents

    @cached(cache=LFUCache(8192))
    def fitness_score(self, pickled_combination: bytes):  # nosec
        combination = pickle.loads(pickled_combination)
        try:
            # We are not in control of the combination values, so they could be zero
            sum_sacks = 100 / sum(combination.values())
        except ZeroDivisionError:
            sum_sacks = 0

        products: List[Product] = []
        for p in self.products:
            if combination[p["id"]] > 0:
                products.append(
                    Product(
                        product_id=p["id"],
                        share=(sum_sacks * combination[p["id"]]) / 100,
                        cumulative=p["cumulative"],
                        sacks=combination[p["id"]],
                        mass=(combination[p["id"]] * p["sack_size"]),
                    )
                )

        experimental_bridge = calculate_blend_cumulative(products)
        diff_list = []
        i = 0
        for theo, blend in zip(self.bridge, experimental_bridge):
            if self.particle_range[0] < SIZE_STEPS[i] < self.particle_range[1]:
                diff_list.append((theo - blend) ** 2)
            i += 1

        _mean = np.mean(diff_list)
        score = np.sqrt(_mean)
        mass_score = self.mass_score(products)
        number_of_products_score = self.n_products_score(products)
        return score * mass_score * number_of_products_score, experimental_bridge

    def optimal(self, population):
        results = []
        for combination in population:
            score, exp_bridge = self.fitness_score(pickle.dumps(combination))
            results.append({"score": score, "combination": combination, "bridge": exp_bridge})

        results.sort(key=lambda r: (r["score"]))
        return results[0]["score"], results[0]["combination"], results[0]["bridge"]

    def crossover(self, parents, children):
        number_of_products = len(self.products)

        first_parent_ids = list(parents[0].keys())
        second_parent_ids = list(parents[1].keys())
        first_parent_sacks = list(parents[0].values())
        second_parent_sacks = list(parents[1].values())

        if len(first_parent_ids) <= 1:
            raise Exception("Why does this happen!?")

        for i in range(self.NUMBER_OF_CHILDREN // 2):
            cross_point = random.randint(1, number_of_products - 1)
            first_child_id_list = first_parent_ids[:cross_point] + second_parent_ids[cross_point:]
            second_child_id_list = second_parent_ids[:cross_point] + first_parent_ids[cross_point:]
            first_child_sacks_list = first_parent_sacks[:cross_point] + second_parent_sacks[cross_point:]
            second_child_sacks_list = second_parent_sacks[:cross_point] + first_parent_sacks[cross_point:]

            first_child_dict = {}
            second_child_dict = {}
            for j in range(len(first_child_id_list)):
                first_child_dict[first_child_id_list[j]] = first_child_sacks_list[j]
                second_child_dict[second_child_id_list[j]] = second_child_sacks_list[j]

            children[2 * i] = first_child_dict
            children[2 * i + 1] = second_child_dict

        return children

    @staticmethod
    def swap_bit_mutation(child):
        if len(child) > 1:
            x = random.choice(list(child.keys()))
            y = random.choice(list(child.keys()))

            attempts = 0
            while (x == y) and (child[x] == child[y]) and (attempts < 50):
                y = random.choice(list(child.keys()))
                attempts += 1

            child[x], child[y] = child[y], child[x]

        return child

    @staticmethod
    def inverse_mutation(child):
        child_ids = list(child.keys())
        child_sacks = list(child.values())

        if len(child_sacks) > 1:
            x = random.randint(0, len(child_sacks))
            y = random.randint(0, len(child_sacks))

            while x == y:
                y = random.randint(0, len(child_sacks))

            if abs(x - y) <= 1:
                if (x == len(child_sacks)) or (y == len(child_sacks)):
                    x -= 1
                    y -= 1
                child_sacks[x], child_sacks[y] = child_sacks[y], child_sacks[x]
            elif x < y:
                toReverse = child_sacks[x:y]
                toReverse.reverse()
                child_sacks[x:y] = toReverse
            else:
                toReverse = child_sacks[y:x]
                toReverse.reverse()
                child_sacks[y:x] = toReverse

            new_child = {}
            for i in range(len(child_ids)):
                new_child[child_ids[i]] = child_sacks[i]

            return new_child

        return child

    def flip_bit_mutation(self, child):
        key = random.choice(list(child.keys()))
        max_mutator = child[key] // 2
        if max_mutator < self.MIN_MUTATOR_VALUE:
            max_mutator = self.MIN_MUTATOR_VALUE

        mutator = random.randint(-max_mutator, max_mutator)
        child[key] = child[key] + mutator
        return child

    def execute_mutation(self, children):
        for child in children:
            mute = random.randint(0, int((self.NUMBER_OF_MUTATIONS / self.MUTATION_PROBABILITY) * 100))
            if mute == 1:
                child = self.swap_bit_mutation(child)
            elif mute == 2:
                child = self.inverse_mutation(child)
            elif mute == 3:
                child = self.flip_bit_mutation(child)

            for id in child:
                if child[id] < 0:
                    child[id] = 0

        return children

    def mass_score(self, products: List[Product]) -> float:
        combination_mass = sum([p.mass for p in products])
        diff = abs(self.mass_goal - combination_mass)
        percentage_diff = (100 / self.mass_goal) * diff
        # If mass diff more than 10% from goal, score is 10 (
        if percentage_diff > 10:
            return 10
        # If mass within 10% of goal, use percentage decimal as score
        return (percentage_diff / self.MASS_IMPORTANCE) + 1

    def n_products_score(self, products: List[Product]) -> float:
        if len(products) <= self.max_products:
            return 1

        diff = len(products) - self.max_products
        percentage_diff = (100 / self.max_products) * diff
        return (percentage_diff / self.NUMBER_OF_PRODUCTS_IMPORTANCE) + 1
