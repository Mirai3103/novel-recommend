from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_async_db


async def db_dep(db: AsyncSession = Depends(get_async_db)) -> AsyncSession:
    return db


