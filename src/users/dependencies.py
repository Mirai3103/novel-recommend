from typing import Annotated
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from src.database import get_db
from src.models import User
from src.users.utils import decode_access_token
from src.users.service import get_user_by_id

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/users/login")


def db_dep(db: Session = Depends(get_db)) -> Session:
    """Database session dependency"""
    return db


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(db_dep)
) -> User:
    """Get current authenticated user from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    user_id = decode_access_token(token)
    if user_id is None:
        raise credentials_exception
    
    user = get_user_by_id(db, user_id)
    if user is None:
        raise credentials_exception
    
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]

