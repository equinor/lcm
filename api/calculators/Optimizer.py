# This module contains functions for performing an
# optimization of LCM blends based on input products,
# weights and a bridge.
import random
import time
import numpy as np

from util.utils import get_min_max_diff

POPULATION_SIZE = 20
MAX_NUMBER_OF_SACKS = 60
NUMBER_OF_CHILDREN = 18
NUMBER_OF_PARENTS = 2
MUTATION_PROBABILITY = 20  # percent
NUMBER_OF_MUTATIONS = 3
PRODUCTS_TO_BE_USED = 5
MIN_MUTATOR_VALUE = 5

MAX_CO2 = 1300
MIN_CO2 = 800

MAX_COST = 450
MIN_COST = 123


K_B = 2
K_C = 0.25
K_E = 0.25
K_M = 5

MASS_GOAL = 350
TOLERANCE = 0.15

products_list = []

ENVIRONMENTAL_SCORE = {
    "GREEN": 100,
    "YELLOW": 66,
    "RED": 33,
    "BLACK": 0,
}


# This function calculates an optimal blend of products,
# based on the input products, weights and bridge.
# The weights determine how much weight should be put
# on each of four categories: bridge fit, cost, CO2, and mass.
# The function returns the best blend as a dictionary mapping ids
# to number of sacks, a score for each of the different weights,
# the execution time and the number of iterations.
def optimize(
    products, weights, bridge, mass, MaxAndMinList, max_iterations, size_steps_filter
):  # weights = [W_B, W_C, W_E, W_M], MaxAnMinList =[MAX_COST, MIN_COS, MAX_CO2, MIN_CO2]
    global products_list, MASS_GOAL, MAX_NUMBER_OF_SACKS, MAX_CO2, MIN_CO2, MAX_COST, MIN_COST

    MASS_GOAL = mass
    products_list = products
    MAX_NUMBER_OF_SACKS = (MASS_GOAL // (averageSackSize() * min(PRODUCTS_TO_BE_USED, len(products_list)))) * 2

    MAX_COST = MaxAndMinList[0]
    MIN_COST = MaxAndMinList[1]
    MAX_CO2 = MaxAndMinList[2]
    MIN_CO2 = MaxAndMinList[3]

    start_index = int(size_steps_filter * len(bridge))

    start = time.time()
    parents = []

    population, children = initializePopulation()

    parents = selectParents(population, weights, bridge, start_index)

    iterations = 0

    optimal_found = optimalFound(population, weights, bridge, start_index)

    while (not optimal_found) and (iterations < max_iterations):
        parents = selectParents(population, weights, bridge, start_index)

        children = crossover(parents, children)

        children = executeMutation(children)

        population = parents + children

        optimal_found = optimalFound(population, weights, bridge, start_index)

        iterations += 1

    best, actual_fitness = optimal(population, weights, bridge, start_index)

    (
        best_fit_score,
        mass_score,
        cost_score,
        co2_score,
        environmental_score,
    ) = calculate_scores(best, bridge, start_index)

    end = time.time()

    return (
        best,
        best_fit_score,
        mass_score,
        cost_score,
        co2_score,
        environmental_score,
        end - start,
        iterations,
        actual_fitness,
    )


# This function creates a random population from
# the products_list with the available products.
def initializePopulation():
    global products_list

    population = []
    children = []

    if PRODUCTS_TO_BE_USED < len(products_list):
        id_list = []

        for product in products_list:
            id_list.append(product["id"])

        for i in range(POPULATION_SIZE):
            combo_dict = {}
            for j in range(len(products_list)):
                combo_dict[products_list[j]["id"]] = 0

            used_id_list = []

            for i in range(PRODUCTS_TO_BE_USED):
                id = random.choice(id_list)
                while id in used_id_list:
                    id = random.choice(id_list)
                used_id_list.append(id)

            for id in used_id_list:
                combo_dict[id] = random.randint(0, MAX_NUMBER_OF_SACKS)

            population.append(combo_dict)

    else:
        for i in range(POPULATION_SIZE):
            combo_dict = {}
            for j in range(len(products_list)):
                combo_dict[products_list[j]["id"]] = random.randint(0, MAX_NUMBER_OF_SACKS)
            population.append(combo_dict)

    for i in range(NUMBER_OF_CHILDREN):
        children.append([])

    return population, children


# This function calculates the fitness value of the combinations.
# The goal is to minimize the value.
def fitnessFunction(combination, weights, bridge, start_index):
    W_B = weights[0]
    W_C = weights[1]
    W_E = weights[2]
    W_M = weights[3]

    cost = costOfCombination(combination)
    co2 = CO2OfCombination(combination)
    mass = massOfCombination(combination)

    mass_deviation = (MASS_GOAL - mass) ** 2
    k_b = K_B
    bridge_deviation = 0

    sack_sum = sacksInCombination(combination)

    if sack_sum > 0:
        for i in range(start_index, len(bridge)):

            step_deviation = calculateBridgeDeviation(i, combination, sack_sum, bridge)
            bridge_deviation += step_deviation ** 2

            if step_deviation < 0:
                k_b = 10 * K_B

    else:
        return np.inf

    return (
        W_B * k_b * sigmoid((bridge_deviation / 10000) * 7 - 3.5)
        + W_C * K_C * sigmoid((((cost / sack_sum) - MIN_COST) / get_min_max_diff(MAX_COST, MIN_COST)) * 7 - 3.5)
        + W_E * K_E * sigmoid((((co2 / sack_sum) - MIN_CO2) / get_min_max_diff(MAX_CO2, MIN_CO2)) * 7 - 3.5)
        + W_M * K_M * sigmoid((mass_deviation / 15625000) * 7 - 3.5)
    )


# This function calculates the total cost
# of the combination given as input.
def costOfCombination(combination):
    sum = 0
    for id in combination:
        product = getProductFromID(id)
        sum += product["cost"] * combination[id]

    return sum


# This function calculates the total amount
# of CO2 emissions of the combination given
# as input.
def CO2OfCombination(combination):
    sum = 0

    for id in combination:
        product = getProductFromID(id)
        sum += product["co2"] * combination[id]

    return sum


# This function calculates the total mass
# of the combination given as input.
def massOfCombination(combination):
    sum = 0

    for id in combination:
        product = getProductFromID(id)
        sum += product["sack_size"] * combination[id]

    return sum


# This function calculates the total amount
# of sacks in the combination given as input.
def sacksInCombination(combination):
    sum = 0

    for id in combination:
        sum += combination[id]

    return sum


# This function uses the fitnessFunction
# to check if the current population contains
# a combination that has a fitness value
# lower than the given tolerance.
def optimalFound(population, weights, bridge, start_index):
    fitness = []

    for combination in population:
        fitness = fitnessFunction(combination, weights, bridge, start_index)
        if fitness <= TOLERANCE:
            return True

    return False


# This function takes the population as input
# and finds the combination with the best
# fitness value and returns that combination.
def optimal(population, weights, bridge, start_index):
    fitness = []
    fit_dict = {}

    for combination in population:
        this_fitness = fitnessFunction(combination, weights, bridge, start_index)
        fitness.append(this_fitness)
        fit_dict[this_fitness] = combination

    fitness.sort()

    return fit_dict[fitness[0]], fitness[0]


# This function selects the 2 best combinations based
# on their fitness value
def selectParents(population, weights, bridge, start_index):
    fitness = []
    fit_dict = {}

    for combination in population:
        this_fitness = fitnessFunction(combination, weights, bridge, start_index)
        fitness.append(this_fitness)
        fit_dict[this_fitness] = combination

    fitness.sort()

    parents = [fit_dict[fitness[0]], fit_dict[fitness[1]]]

    return parents


# Crossover varies the combinations
def crossover(parents, children):
    global products_list

    number_of_products = len(products_list)

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


# This function calculates the deviation of the blend mix
# distribution from the optimal bridge distribution
def calculateBridgeDeviation(index, combination, sack_sum, bridge):
    diff = 0
    for id in combination:
        product = getProductFromID(id)
        diff += product["cumulative"][index] * combination[id]

    deviation = bridge[index] - (diff / sack_sum)

    return deviation


# This function calculates the combinations
# different scores. The mass_score and
# best_fit_score are calculated as deviations
# from a desired value, and the cost_score
# and co2_score are calculated as a total sum.
def calculate_scores(combination, bridge, start_index):
    global MASS_GOAL
    cost = costOfCombination(combination)
    co2 = CO2OfCombination(combination)
    environmental = environmentalOfCombination(combination)
    mass = massOfCombination(combination)
    sack_sum = sacksInCombination(combination)

    mass_deviation = abs(MASS_GOAL - mass)

    bridge_deviation = 0

    if sack_sum > 0:
        for i in range(start_index, len(bridge)):
            step_deviation = calculateBridgeDeviation(i, combination, sack_sum, bridge)
            bridge_deviation += abs(step_deviation)

        bridge_sum = 0
        for i in range(start_index, len(bridge)):
            bridge_sum += bridge[i]

        best_fit_score = ((bridge_sum - bridge_deviation * 2) / bridge_sum) * 100
        if best_fit_score < 0:
            best_fit_score = 0
        elif best_fit_score > 100:
            best_fit_score = 100

        mass_score = 100 - (mass_deviation / MASS_GOAL) * 100
        if mass_score < 0:
            mass_score = 0
        elif mass_score > 100:
            mass_score = 100

        cost_score = 100 - ((cost / sack_sum - MIN_COST) / get_min_max_diff(MAX_COST, MIN_COST)) * 100
        if cost_score < 0:
            cost_score = 0
        elif cost_score > 100:
            cost_score = 100

        co2_score = 100 - ((co2 / sack_sum - MIN_CO2) / get_min_max_diff(MAX_CO2, MIN_CO2)) * 100
        if co2_score < 0:
            co2_score = 0
        elif co2_score > 100:
            co2_score = 100

        environmental_score = environmental / sack_sum
        if environmental_score < 0:
            environmental_score = 0
        elif environmental_score > 100:
            environmental_score = 100

    else:

        best_fit_score = 0

        mass_score = 0

        cost_score = 0

        co2_score = 0

    return best_fit_score, mass_score, cost_score, co2_score, environmental_score


# This function return one single
# product given from the input id.
def getProductFromID(id):
    global products_list

    for product in products_list:
        if product["id"] == id:
            return product


def sigmoid(value):
    return 1 / (1 + np.exp(-value))


def environmentalOfCombination(combination):
    sum = 0
    for id in combination:
        product = getProductFromID(id)
        enviromental = product["environmental"].upper()
        sum += combination[id] * ENVIRONMENTAL_SCORE[enviromental]

    return sum


def averageSackSize():
    global products_list

    sum = 0
    for product in products_list:
        sum += product["sack_size"]

    return sum / len(products_list)
