def getMaxAndMinValues(products):
    Cost_list = [int(p["cost"]) for p in products]
    CO2_list = [int(p["co2"]) for p in products]

    return [max(Cost_list), min(Cost_list), max(CO2_list), min(CO2_list)]


def get_min_max_diff(max, min):
    return max - min if max - min != 0 else 1
