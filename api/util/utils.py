def print_progress(i: int, goal: int):
    if i % 100 == 0:
        progress = round(100 / goal * i, 2)
        print(f"Progress: {progress}%")
