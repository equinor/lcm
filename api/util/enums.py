class BridgeOption:
    MAXIMUM_PORESIZE = "MAXIMUM_PORESIZE"
    AVERAGE_PORESIZE = "AVERAGE_PORESIZE"
    PERMEABILITY = "PERMEABILITY"


def bridge_mode_int(mode: str):
    if mode == "PERMEABILITY":
        return 0
    if mode == "AVERAGE_PORESIZE":
        return 1
    if mode == "MAXIMUM_PORESIZE":
        return 2
    raise ValueError(f"Invalid bridge mode string '{mode}'")


def bridge_mode_str(mode: int):
    if mode == 0:
        return "PERMEABILITY"
    if mode == 1:
        return "AVERAGE_PORESIZE"
    if mode == 2:
        return "MAXIMUM_PORESIZE"
    raise ValueError(f"Invalid bridge mode int '{mode}'")
