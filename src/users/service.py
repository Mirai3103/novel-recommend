from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

from src.models import User
from src.users.schemas import UserRegister, UserUpdate
from src.users.utils import hash_password, verify_password
from src.users.exceptions import UserAlreadyExistsError, InvalidCredentialsError


def create_user(db: Session, data: UserRegister) -> User:
    """Create a new user"""
    # Check if username or email already exists
    existing = db.query(User).filter(
        (User.username == data.username) | (User.email == data.email)
    ).first()
    if existing:
        raise UserAlreadyExistsError("Username or email already exists")
    print(data.password)
    user = User(
        username=data.username,
        email=data.email,
        password=hash_password(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_user_by_id(db: Session, user_id: UUID) -> Optional[User]:
    """Get user by ID"""
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_username(db: Session, username: str) -> Optional[User]:
    """Get user by username"""
    return db.query(User).filter(User.username == username).first()


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Get user by email"""
    return db.query(User).filter(User.email == email).first()


def authenticate_user(db: Session, username: str, password: str) -> User:
    """Authenticate user and return user object"""
    user = get_user_by_username(db, username)
    if not user:
        raise InvalidCredentialsError("Invalid username or password")
    if not verify_password(password, user.password):
        raise InvalidCredentialsError("Invalid username or password")
    return user


def update_user(db: Session, user_id: UUID, data: UserUpdate) -> Optional[User]:
    """Update user"""
    user = get_user_by_id(db, user_id)
    if not user:
        return None
    
    if data.username is not None:
        # Check if new username is taken by another user
        existing = db.query(User).filter(
            User.username == data.username,
            User.id != user_id
        ).first()
        if existing:
            raise UserAlreadyExistsError("Username already exists")
        user.username = data.username
    
    if data.email is not None:
        # Check if new email is taken by another user
        existing = db.query(User).filter(
            User.email == data.email,
            User.id != user_id
        ).first()
        if existing:
            raise UserAlreadyExistsError("Email already exists")
        user.email = data.email
    
    if data.avatar_url is not None:
        user.avatar_url = data.avatar_url
    
    if data.password is not None:
        user.password = hash_password(data.password)
    
    db.commit()
    db.refresh(user)
    return user

