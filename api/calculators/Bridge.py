# This module calculates a bridge distribution,
# based an input option, value and size_steps.
# The option is either "MAXIMUM_PORESIZE",
# "AVERAGE_PORESIZE" or "PERMEABILITY".

from util.Classes import Mode
from math import sqrt

DEFAULT_D_VALUE = 50
ALTERNATE_D_VALUE = 90
ROUNDING_DECIMALS = 3  # Amount of decimals in the rounded numbers

def calculateBridgeDistribution(mode, value, size_steps):

    bridge_List = []
    d_Value = DEFAULT_D_VALUE
    bridge_Input = value

    if(mode == Mode.Permeability):
        bridge_Input = sqrt(value)

    elif(mode == Mode.Maximum_Poresize):
        d_Value = ALTERNATE_D_VALUE

    result = 100*(sqrt(bridge_Input)/d_Value)

    for size in size_steps:
        if sqrt(size) > result:
            bridge_List.append(100)
        else:
            bridge_List.append(round(100*sqrt(size)/result, ROUNDING_DECIMALS))

    return bridge_List
