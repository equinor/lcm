# ruff: noqa: S311
import random
from dataclasses import dataclass, field
from datetime import datetime, timedelta

import numpy as np
from cachetools import LFUCache, cached
from cachetools.keys import hashkey

from calculators.bridge import SIZE_STEPS, calculate_blend_cumulative
from classes.product import Product
from use_cases.get_products import ProductDTO
from util.exceptions import InternalErrorException, ValidationException


def hash_combination(self, combination: dict[str, float]):
    return hashkey(frozenset(combination.items()))


@dataclass
class OptimizerWeights:
    bridge: int
    mass: int
    products: int

    def __post_init__(self):
        for i in self.__dict__.values():
            if not 0 <= i <= 10:
                raise ValidationException("Weighting values must be between 1 and 10")


@dataclass
class OptimizationResult:
    combination: dict[str, float]
    cumulative_bridge: list[float]
    curve: list[float]
    execution_time: timedelta
    iterations: int
    score: float
    bridge_score: float


@dataclass
class Optimizer:
    # constants
    POPULATION_SIZE = 20
    NUMBER_OF_CHILDREN = 18  # must be a multiple of 2
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
    MASS_IMPORTANCE = 10
    NUMBER_OF_PRODUCTS_IMPORTANCE = 40

    # parameters
    bridge: list[float]
    products: list[ProductDTO]
    density_goal: float = 350
    volume: float = 10
    max_iterations: int = 500
    max_products: int = 999
    particle_range: tuple[float, float] = (1.0, 100)
    weights: OptimizerWeights = field(default_factory=lambda: OptimizerWeights(bridge=5, mass=5, products=5))

    def __post_init__(self):
        if self.particle_range[1] <= 0:
            self.particle_range = (self.particle_range[0], 10000)

    @property
    def mass_goal(self):
        return self.density_goal * self.volume

    @property
    def sum_weights(self):
        return self.weights.bridge + self.weights.mass + self.weights.products

    def optimize(self) -> OptimizationResult:
        start = datetime.now()
        max_initial_density = self.density_goal // min(self.max_products, len(self.products))

        score_progress = []
        population, children = self.initialize_population(max_initial_density)
        iterations = 0
        fittest_combo, score, experimental_bridge = {}, 100, []
        for _ in range(self.max_iterations):
            parents = self.select_parents(population)
            children = self.crossover(parents, children)
            children = self.execute_mutation(children)
            population = parents + children
            score, fittest_combo, experimental_bridge = self.optimal(population)
            score_progress.append(score)

        bridge_score = self.bridge_score(experimental_bridge)  # standard deviaton

        return OptimizationResult(
            combination={k: v for k, v in fittest_combo.items() if v > 0},
            cumulative_bridge=experimental_bridge,
            curve=score_progress,
            execution_time=(datetime.now() - start),
            iterations=iterations,
            score=score,
            bridge_score=bridge_score,
        )

    def calculate_performance(self, experimental_bridge: list, products_result: list[Product]) -> dict:
        bridge_fitness = 100 - self.bridge_score(experimental_bridge)
        mass_score = 100 - self.mass_score(products_result, squash=False)
        products_score = 100 - self.n_products_score(products_result, squash=False)

        return {"bridge": bridge_fitness, "mass": mass_score, "products": products_score}

    def initialize_population(self, max_initial_density):
        population = []
        children = []

        if self.max_products < len(self.products):
            id_list = [p.id for p in self.products]

            for _ in range(self.POPULATION_SIZE):
                combo_dict = dict.fromkeys(id_list, 0)
                used_id_list = []

                for _ in range(self.max_products):
                    id = random.choice(id_list)
                    while id in used_id_list:
                        id = random.choice(id_list)
                    used_id_list.append(id)

                for id in used_id_list:
                    combo_dict[id] = int(round(random.uniform(0, max_initial_density), 2))

                population.append(combo_dict)

        else:
            for _i in range(self.POPULATION_SIZE):
                combo_dict = {}
                for j in range(len(self.products)):
                    combo_dict[self.products[j].id] = round(random.uniform(0, max_initial_density), 2)
                population.append(combo_dict)

        for _i in range(self.NUMBER_OF_CHILDREN):
            children.append([])

        return population, children

    def select_parents(self, population):
        fitness = []
        fit_dict = {}

        for combination in population:
            score, _ = self.fitness_score(combination)
            fitness.append(score)
            fit_dict[score] = combination

        fitness.sort()

        parents = [fit_dict[fitness[0]], fit_dict[fitness[1]]]

        return parents

    def bridge_score(self, experimental_bridge):
        if len(self.bridge) != len(experimental_bridge):
            raise InternalErrorException("The experimental bridge has a different size than the theoretical")
        diff_list = []
        i = 0
        for theo, blend in zip(self.bridge, experimental_bridge, strict=False):
            if self.particle_range[0] < SIZE_STEPS[i] < self.particle_range[1]:
                diff_list.append((theo - blend) ** 2)
            i += 1

        _mean = np.mean(diff_list)
        score = np.sqrt(_mean)
        return float(score)

    @cached(cache=LFUCache(8192), key=hash_combination)
    def fitness_score(self, combination: dict[str, float]):
        products: list[Product] = []
        for p in self.products:
            if combination[p.id] > 0:
                if p.cumulative is None:
                    raise InternalErrorException(f"Product {p.id} does not have cumulative distribution data")
                products.append(
                    Product(
                        product_id=p.id,
                        share=combination[p.id] / sum(combination.values()),
                        cumulative=p.cumulative,
                        sacks=combination[p.id],
                        mass=(combination[p.id] * self.volume),
                    )
                )

        experimental_bridge = calculate_blend_cumulative(products)
        _bridge_score = self.bridge_score(experimental_bridge) * (self.weights.bridge / self.sum_weights)
        mass_score = self.mass_score(products) * (self.weights.mass / self.sum_weights)
        number_of_products_score = self.n_products_score(products) * (self.weights.products / self.sum_weights)
        return _bridge_score + mass_score + number_of_products_score, experimental_bridge

    def optimal(self, population):
        results = []
        for combination in population:
            score, exp_bridge = self.fitness_score(combination)
            results.append({"score": score, "combination": combination, "bridge": exp_bridge})

        results.sort(key=lambda r: r["score"])
        return results[0]["score"], results[0]["combination"], results[0]["bridge"]

    def crossover(self, parents, children):
        number_of_products = len(self.products)

        first_parent_ids = list(parents[0].keys())
        second_parent_ids = list(parents[1].keys())
        first_parent_densities = list(parents[0].values())
        second_parent_densities = list(parents[1].values())

        for i in range(self.NUMBER_OF_CHILDREN // 2):
            cross_point = random.randint(1, number_of_products - 1)
            first_child_id_list = first_parent_ids[:cross_point] + second_parent_ids[cross_point:]
            second_child_id_list = second_parent_ids[:cross_point] + first_parent_ids[cross_point:]
            first_child_sacks_list = first_parent_densities[:cross_point] + second_parent_densities[cross_point:]
            second_child_sacks_list = second_parent_densities[:cross_point] + first_parent_densities[cross_point:]

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
        child_densities = list(child.values())

        x = random.randint(0, len(child_densities))
        y = random.randint(0, len(child_densities))

        while x == y:
            y = random.randint(0, len(child_densities))

        if abs(x - y) <= 1:
            if (x == len(child_densities)) or (y == len(child_densities)):
                x -= 1
                y -= 1
            child_densities[x], child_densities[y] = child_densities[y], child_densities[x]
        elif x < y:
            toReverse = child_densities[x:y]
            toReverse.reverse()
            child_densities[x:y] = toReverse
        else:
            toReverse = child_densities[y:x]
            toReverse.reverse()
            child_densities[y:x] = toReverse

        new_child = {}
        for i in range(len(child_ids)):
            new_child[child_ids[i]] = child_densities[i]
        return new_child

    def flip_bit_mutation(self, child):
        key = random.choice(list(child.keys()))
        max_mutator = int(child[key] // 2)
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

    def mass_score(self, products: list[Product], squash: bool = True) -> float:
        combination_mass = sum([p.mass for p in products])
        diff = abs(self.mass_goal - combination_mass)
        percentage_diff = (100 / self.mass_goal) * diff
        if squash:
            return percentage_diff / self.MASS_IMPORTANCE
        return percentage_diff

    def n_products_score(self, products: list[Product], squash: bool = True) -> float:
        if len(products) <= self.max_products:
            return 0
        diff = len(products) - self.max_products
        percentage_diff = (100 / self.max_products) * diff
        if squash:
            return percentage_diff / self.NUMBER_OF_PRODUCTS_IMPORTANCE
        return percentage_diff
