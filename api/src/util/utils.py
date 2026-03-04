import re


def camel_to_underscore(name):
    """Convert camelCase to snake_case."""
    camel_case_pattern = re.compile(r"([A-Z])")
    return camel_case_pattern.sub(lambda x: "_" + x.group(1).lower(), name)


def underscore_to_camel(name):
    """Convert snake_case to camelCase."""
    snake_case_pattern = re.compile(r"_([a-z])")
    return snake_case_pattern.sub(lambda x: x.group(1).upper(), name)


def convert_keys_camel_to_underscore(data: dict) -> dict:
    """Recursively convert all keys in a dictionary from camelCase to snake_case."""
    return {
        camel_to_underscore(k): convert_keys_camel_to_underscore(v) if isinstance(v, dict) else v
        for k, v in data.items()
    }


def convert_keys_underscore_to_camel(data: dict) -> dict:
    """Recursively convert all keys in a dictionary from snake_case to camelCase."""
    return {
        underscore_to_camel(k): convert_keys_underscore_to_camel(v) if isinstance(v, dict) else v
        for k, v in data.items()
    }
