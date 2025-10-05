from enum import Enum
from typing import Tuple

DEFAULT_PAGE_SIZE = 50
MAX_PAGE_SIZE = 200



class SortDir(str,Enum):
    ASC ="asc"
    DESC = "desc"


def paginate_params(skip: int | None, limit: int | None, default: int, maximum: int) -> Tuple[int, int]:
    s = max(0, skip or 0)
    l = limit or default
    l = max(1, min(l, maximum))
    return s, l
