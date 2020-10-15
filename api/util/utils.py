def getMaxAndMinValues(metadata):
    CO2_list = []
    Cost_list = []
    MaxAndMinList = []

    for key in metadata:
        Cost_list.append(int(metadata[key]["cost"]))
        CO2_list.append(int(metadata[key]["co2"]))

    MaxAndMinList.append(max(Cost_list))
    MaxAndMinList.append(min(Cost_list))
    MaxAndMinList.append(max(CO2_list))
    MaxAndMinList.append(min(CO2_list))

    return MaxAndMinList

def get_min_max_diff(max, min):
    return max - min if max - min != 0 else 1