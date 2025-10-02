from typing import Tuple


def paginate_params(skip: int | None, limit: int | None, default: int, maximum: int) -> Tuple[int, int]:
    s = max(0, skip or 0)
    l = limit or default
    l = max(1, min(l, maximum))
    return s, l

