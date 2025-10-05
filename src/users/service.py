from typing import Optional
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_

from src.models import User
from src.users.schemas import UserRegister, UserUpdate
from src.users.utils import hash_password, verify_password
from src.users.exceptions import UserAlreadyExistsError, InvalidCredentialsError


async def create_user(db: AsyncSession, data: UserRegister) -> User:
    """Create a new user"""
    # Check if username or email already exists
    stmt = select(User).filter(
        or_(User.username == data.username, User.email == data.email)
    )
    result = await db.execute(stmt)
    existing = result.scalar_one_or_none()
    if existing:
        raise UserAlreadyExistsError("Username or email already exists")
    print(data.password)
    user = User(
        username=data.username,
        email=data.email,
        password=hash_password(data.password),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def get_user_by_id(db: AsyncSession, user_id: UUID) -> Optional[User]:
    """Get user by ID"""
    stmt = select(User).filter(User.id == user_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_user_by_username(db: AsyncSession, username: str) -> Optional[User]:
    """Get user by username"""
    stmt = select(User).filter(User.username == username)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    """Get user by email"""
    stmt = select(User).filter(User.email == email)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def authenticate_user(db: AsyncSession, username: str, password: str) -> User:
    """Authenticate user and return user object"""
    user = await get_user_by_username(db, username)
    if not user:
        raise InvalidCredentialsError("Invalid username or password")
    if not verify_password(password, user.password):
        raise InvalidCredentialsError("Invalid username or password")
    return user


async def update_user(db: AsyncSession, user_id: UUID, data: UserUpdate) -> Optional[User]:
    """Update user"""
    user = await get_user_by_id(db, user_id)
    if not user:
        return None
    
    if data.username is not None:
        # Check if new username is taken by another user
        stmt = select(User).filter(
            User.username == data.username,
            User.id != user_id
        )
        result = await db.execute(stmt)
        existing = result.scalar_one_or_none()
        if existing:
            raise UserAlreadyExistsError("Username already exists")
        user.username = data.username
    
    if data.email is not None:
        # Check if new email is taken by another user
        stmt = select(User).filter(
            User.email == data.email,
            User.id != user_id
        )
        result = await db.execute(stmt)
        existing = result.scalar_one_or_none()
        if existing:
            raise UserAlreadyExistsError("Email already exists")
        user.email = data.email
    
    if data.avatar_url is not None:
        user.avatar_url = data.avatar_url
    
    if data.password is not None:
        user.password = hash_password(data.password)
    
    await db.commit()
    await db.refresh(user)
    return user

