def read_file(path: str) -> bytes:
    with open(path, "rb") as file:
        return file.read()
