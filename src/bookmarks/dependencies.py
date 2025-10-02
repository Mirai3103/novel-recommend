from fastapi import Depends
from sqlalchemy.orm import Session

from src.database import get_db


def db_dep(db: Session = Depends(get_db)) -> Session:
    return db

