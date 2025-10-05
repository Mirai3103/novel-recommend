
import time

from pydantic import BaseModel
from src.database import Base


def measure_time(func):
    async def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = await func(*args, **kwargs)
        end = time.perf_counter()
        print(f"{func.__name__} took {end - start:.4f} seconds")
        return result
    return wrapper
from sqlalchemy import select

def select_from_schema(model: Base, schema: BaseModel):
    columns = [getattr(model, f) for f in schema.model_fields.keys() if hasattr(model, f)]
    return select(*columns)

