from bisect import bisect_left

from numpy import log

from calculators.bridge import SIZE_STEPS


def find_closest_bigger_index(array: list[float], target: float) -> int:
    index = bisect_left(array, target)
    if index == 0:
        raise ValueError("Failed to find closest biggest index")
    return index + 1


def log_interpolate_or_extrapolate(xMin: float, yMin: float, xMax: float, yMax: float, z: float) -> float:
    increase = (log(z) - log(xMin)) / (log(xMax) - log(xMin))
    return increase * (yMax - yMin) + yMin


def fraction_interpolator_and_extrapolator(
    xArray: list[float], yArray: list[float], zArray: list[float] = SIZE_STEPS
) -> list[float]:
    sizes_dict = {size: 0 for size in zArray}  # Populate size_dict with 0 values
    starting_index = find_closest_bigger_index(zArray, min(xArray)) - 1
    s = sum(yArray)
    print(f"Sum Y: {s}")

    for zIndex, z in enumerate(zArray[starting_index:]):
        if z < xArray[0]:  # Don't extrapolate down from first measuring point
            continue
        # If z is above the range of xArray, use the last two points for extrapolation
        elif z > xArray[-1]:
            yz = log_interpolate_or_extrapolate(xArray[-2], yArray[-2], xArray[-1], yArray[-1], z)
        else:
            # Find the interval that z falls into for interpolation
            for i in range(1, len(xArray)):
                if xArray[i - 1] <= z <= xArray[i]:
                    yz = log_interpolate_or_extrapolate(xArray[i - 1], yArray[i - 1], xArray[i], yArray[i], z)
                    break

        if yz > 100:  # 100% volume has been reached. Stop extrapolation. Set all remaining to 100%
            for key in zArray[zIndex + starting_index :]:
                sizes_dict[key] = 100
            return list(sizes_dict.values())

        sizes_dict[z] = round(yz, ndigits=3)

    return list(sizes_dict.values())
