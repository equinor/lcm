# This module calculates the distribution of
# blend of products based on an input product list
# and input size steps.


def calculateBlendDistribution(product_list, size_steps):
    cumulative_distribution = [0] * len(size_steps)
    distribution = [0] * len(size_steps)

    for product in product_list:
        if product.share > 0:
            for i in range(len(size_steps)):
                cumulative_distribution[i] += product.share * product.cumulative[i]
                distribution[i] += product.share * product.distribution[i]

    return cumulative_distribution, distribution
