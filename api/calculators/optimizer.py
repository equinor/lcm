# This module contains functions for performing an
# optimization of LCM blends based on input products,
# weights and a bridge.
import random
from datetime import datetime
from typing import List
from numpy import mean, sqrt
from calculators.bridge import calculate_blend_cumulative
from classes.product import Product
from tabulate import tabulate

POPULATION_SIZE = 20
NUMBER_OF_CHILDREN = 18
NUMBER_OF_PARENTS = 2
MUTATION_PROBABILITY = 50  # percent
NUMBER_OF_MUTATIONS = 30
PRODUCTS_TO_BE_USED = 5
MIN_MUTATOR_VALUE = 5

ENVIRONMENTAL_SCORE = {
    "GREEN": 100,
    "YELLOW": 66,
    "RED": 33,
    "BLACK": 0,
}

PARENTS = []


# This function calculates an optimal blend of products,
# based on the input products, weights and bridge.
# The weights determine how much weight should be put
# on each of four categories: bridge fit, cost, CO2, and mass.
# The function returns the best blend as a dictionary mapping ids
# to number of sacks, a score for each of the different weights,
# the execution time and the number of iterations.
def optimize(
    products: List[dict],
    bridge: List[float],
    mass: int,
    max_iterations: int = 100,
):
    # weights = [W_B, W_C, W_E, W_M], MaxAnMinList =[MAX_COST, MIN_COS, MAX_CO2, MIN_CO2]

    start = datetime.now()
    max_number_of_sacks = (mass // (averageSackSize(products) * min(PRODUCTS_TO_BE_USED, len(products)))) * 2

    score_progress = []
    combination_progress = [[0] for _ in products]
    population, children = initializePopulation(products, max_number_of_sacks)
    iterations = 0
    fittest_combo, score = {}, 100
    for _ in range(max_iterations):
        if _ % 100 == 0:
            print(f"At iteration {_}...")
        parents = selectParents(population, bridge, products)
        children = crossover(parents, children, products)
        children = executeMutation(children)
        population = parents + children
        fittest_combo, score = optimal(population, bridge, products)
        for i, _ in enumerate(products):
            combination_progress[i].append(list(fittest_combo.values())[i])
        score_progress.append(score)

    fittest_combo = {k: v for k, v in fittest_combo.items() if v > 0}
    used_products: List[Product] = []
    for p in fittest_combo:
        p_dict = next(x for x in products if x["id"] == p)
        prod = Product(p_dict["id"], p_dict["title"], None, p_dict["cumulative"])
        prod.add_shares_from_combination(fittest_combo)
        used_products.append(prod)

    cumulative_bridge = calculate_blend_cumulative(product_list=used_products)
    return {
        "combination": fittest_combo,
        "cumulative_bridge": cumulative_bridge,
        # "distribution_bridge": distribution_bridge,
        "curve": score_progress,
        "combination_progress": combination_progress,
        # "best_fit_score": best_fit_score,
        # "cost_score": cost_score,
        # "co2_score": co2_score,
        # "environmental_score": environmental_score,
        "execution_time": (datetime.now() - start).seconds,
        "iterations": iterations,
        "score": score,
    }


# This function creates a random population from
# the products_list with the available products.
def initializePopulation(products, max_number_of_sacks):
    population = []
    children = []

    if PRODUCTS_TO_BE_USED < len(products):
        id_list = [p["id"] for p in products]

        for _ in range(POPULATION_SIZE):
            combo_dict = {id: 0 for id in id_list}
            used_id_list = []

            for _ in range(PRODUCTS_TO_BE_USED):
                id = random.choice(id_list)
                while id in used_id_list:
                    id = random.choice(id_list)
                used_id_list.append(id)

            for id in used_id_list:
                combo_dict[id] = random.randint(0, max_number_of_sacks)

            population.append(combo_dict)

    else:
        for i in range(POPULATION_SIZE):
            combo_dict = {}
            for j in range(len(products)):
                combo_dict[products[j]["id"]] = random.randint(0, max_number_of_sacks)
            population.append(combo_dict)

    for i in range(NUMBER_OF_CHILDREN):
        children.append([])

    return population, children


def fitness_score(combination: dict, theoretical_bridge: List[float], products_list: dict):
    products: List[Product] = []

    for p in products_list:
        if combination[p["id"]] > 0:
            products.append(
                Product(
                    p["id"],
                    p["title"],
                    None,
                    p["cumulative"],
                )
            )
    for p in products:
        p.add_shares_from_combination(combination)

    # sum((PSD(blend)-PSD(optimal blend))^2)
    blend_bridge_cumulative = calculate_blend_cumulative(products)
    diff_list = []
    for theo, blend in zip(theoretical_bridge, blend_bridge_cumulative):
        # Bigger deviations from ideal has a bigger penalty than smaller ones
        diff_list.append((abs(theo - blend) ** 2))
    _mean = mean(diff_list)
    score = sqrt(_mean)
    return score


# # This function uses the fitnessFunction
# # to check if the current population contains
# # a combination that has a fitness value
# # lower than the given tolerance.
# def optimalFound(population, bridge, products):
#     best_fit = 0
#     for combination in population:
#         fitness = fitness_score(combination, bridge, products)
#         if fitness > best_fit:
#             best_fit = fitness
#
#         if best_fit <= TOLERANCE:
#             print(f"Found optimal solution with a score of {best_fit}")
#             return True
#
#     MY_TEST.append(best_fit)
#
#     return False


# This function takes the population as input
# and finds the combination with the best
# fitness value and returns that combination.
def optimal(population, bridge, products):
    fitness = []
    fit_dict = {}

    for combination in population:
        this_fitness = fitness_score(combination, bridge, products)
        fitness.append(this_fitness)
        fit_dict[this_fitness] = combination

    fitness.sort()

    return fit_dict[fitness[0]], fitness[0]


# This function selects the 2 best combinations based
# on their fitness value
def selectParents(population, bridge, products):
    fitness = []
    fit_dict = {}

    for combination in population:
        this_fitness = fitness_score(combination, bridge, products)
        fitness.append(this_fitness)
        fit_dict[this_fitness] = combination

    fitness.sort()

    parents = [fit_dict[fitness[0]], fit_dict[fitness[1]]]
    PARENTS.append(fitness[0])

    return parents


# Crossover varies the combinations
def crossover(parents, children, products):
    number_of_products = len(products)

    first_parent_ids = list(parents[0].keys())
    second_parent_ids = list(parents[1].keys())
    first_parent_sacks = list(parents[0].values())
    second_parent_sacks = list(parents[1].values())

    if len(first_parent_ids) > 1:
        for i in range(NUMBER_OF_CHILDREN // 2):
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

        if NUMBER_OF_CHILDREN % 2 != 0:
            cross_point = random.randint(1, number_of_products - 1)

            first_child_id_list = first_parent_ids[:cross_point] + second_parent_ids[cross_point:]
            first_child_sacks_list = first_parent_sacks[:cross_point] + second_parent_sacks[cross_point:]

            first_child_dict = {}
            for j in range(len(first_child_id_list)):
                first_child_dict[first_child_id_list[j]] = first_child_sacks_list[j]

            children[NUMBER_OF_CHILDREN - 1] = first_child_dict

    else:
        raise Exception("What does this happen!?")
        for i in range(NUMBER_OF_CHILDREN // 2):
            children[2 * i] = parents[0]
            children[2 * i + 1] = parents[1]

        if NUMBER_OF_CHILDREN % 2 != 0:
            children[NUMBER_OF_CHILDREN - 1] = parents[0]

    return children


# In swap bit mutation we swap the number of sacks from different
# products to diversify the combinations
def swapBitMutation(child):
    if len(child) > 1:
        x = random.choice(list(child.keys()))
        y = random.choice(list(child.keys()))

        attempts = 0
        while (x == y) and (child[x] == child[y]) and (attempts < 50):
            y = random.choice(list(child.keys()))
            attempts += 1

        child[x], child[y] = child[y], child[x]

    return child


# In inver mutation we inverse the number of sacks from different
# products to diversify the combinations
def inverseMutation(child):
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


# In flip bit mutation we change the number of sacks from different
# products to diversify the combinations
def flipBitMutation(child):
    key = random.choice(list(child.keys()))
    max_mutator = child[key] // 2
    if max_mutator < MIN_MUTATOR_VALUE:
        max_mutator = MIN_MUTATOR_VALUE

    mutator = random.randint(-max_mutator, max_mutator)
    child[key] = child[key] + mutator
    return child


# This function randomly executes one of the 3 mutations
def executeMutation(children):
    for child in children:
        mute = random.randint(0, int((NUMBER_OF_MUTATIONS / MUTATION_PROBABILITY) * 100))
        if mute == 1:
            child = swapBitMutation(child)
        elif mute == 2:
            child = inverseMutation(child)
        elif mute == 3:
            child = flipBitMutation(child)

        for id in child:
            if child[id] < 0:
                child[id] = 0

    return children


def averageSackSize(products):
    sum = 0
    for product in products:
        sum += product["sack_size"]

    return sum / len(products)
