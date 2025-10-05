from datetime import timedelta
from typing import Annotated, Optional

from fastapi import APIRouter, Body, Depends, HTTPException, status, Response, Cookie
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from src.users.schemas import Token, UserOut, UserRegister, UserUpdate, RefreshTokenRequest
from src.users.dependencies import db_dep, get_current_user, CurrentUser
from src.users.constants import (
    ACCESS_TOKEN_COOKIE_HTTPONLY,
    ACCESS_TOKEN_COOKIE_MAX_AGE,
    ACCESS_TOKEN_COOKIE_NAME,
    ACCESS_TOKEN_COOKIE_SAMESITE,
    ACCESS_TOKEN_COOKIE_SECURE,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    REFRESH_TOKEN_COOKIE_PATH,
    REFRESH_TOKEN_EXPIRE_DAYS,
    REFRESH_TOKEN_COOKIE_NAME,
    REFRESH_TOKEN_COOKIE_MAX_AGE,
    REFRESH_TOKEN_COOKIE_SECURE,
    REFRESH_TOKEN_COOKIE_HTTPONLY,
    REFRESH_TOKEN_COOKIE_SAMESITE,
)
from src.users.service import (
    authenticate_user,
    create_user,
    update_user,
    get_user_by_id,
)
from src.users.utils import create_access_token, create_refresh_token, decode_refresh_token
from src.users.exceptions import (
    InvalidCredentialsError,
    UserAlreadyExistsError,
)


router = APIRouter(prefix="/users", tags=["users"])


@router.post(
    "/register",
    response_model=UserOut,
    status_code=status.HTTP_201_CREATED,
    summary="Register new user",
    description="Create a new user account.",
)
async def register(data: UserRegister, db: AsyncSession = Depends(db_dep)) -> UserOut:
    try:
        user = await create_user(db, data)
        return UserOut.model_validate(user)
    except UserAlreadyExistsError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )


@router.post(
    "/login",
    response_model=Token,
    status_code=status.HTTP_200_OK,
    summary="Login",
    description="Authenticate and receive JWT tokens. Access token in response body, refresh token in HTTP-only cookie.",
)
async def login(
    response: Response,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: AsyncSession = Depends(db_dep)
) -> Token:
    try:
        user = await authenticate_user(db, form_data.username, form_data.password)
        
        # Create access token (short-lived)
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(user.id)},
            expires_delta=access_token_expires
        )
        response.set_cookie(
            key=ACCESS_TOKEN_COOKIE_NAME,
            value=access_token,
            max_age=ACCESS_TOKEN_COOKIE_MAX_AGE,
            httponly=ACCESS_TOKEN_COOKIE_HTTPONLY,
            secure=ACCESS_TOKEN_COOKIE_SECURE,
            samesite=ACCESS_TOKEN_COOKIE_SAMESITE,
        )
        
        # Create refresh token (long-lived)
        refresh_token_expires = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        refresh_token = create_refresh_token(
            data={"sub": str(user.id)},
            expires_delta=refresh_token_expires
        )
        
        # Set refresh token in HTTP-only cookie
        response.set_cookie(
            key=REFRESH_TOKEN_COOKIE_NAME,
            value=refresh_token,
            max_age=REFRESH_TOKEN_COOKIE_MAX_AGE,
            httponly=REFRESH_TOKEN_COOKIE_HTTPONLY,
            secure=REFRESH_TOKEN_COOKIE_SECURE,
            samesite=REFRESH_TOKEN_COOKIE_SAMESITE,
            path=REFRESH_TOKEN_COOKIE_PATH,
        )
        
        return Token(access_token=access_token, token_type="bearer", refresh_token=refresh_token)
    except InvalidCredentialsError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.get(
    "/me",
    response_model=UserOut,
    status_code=status.HTTP_200_OK,
    summary="Get current user",
    description="Get the current authenticated user's information.",
)
async def get_current_user_info(current_user: CurrentUser) -> UserOut:
    return UserOut.model_validate(current_user)


@router.patch(
    "/me",
    response_model=UserOut,
    status_code=status.HTTP_200_OK,
    summary="Update current user",
    description="Update the current authenticated user's information.",
)
async def update_current_user(
    data: UserUpdate,
    current_user: CurrentUser,
    db: AsyncSession = Depends(db_dep)
) -> UserOut:
    try:
        user = await update_user(db, current_user.id, data)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return UserOut.model_validate(user)
    except UserAlreadyExistsError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )


@router.post(
    "/refresh",
    response_model=Token,
    status_code=status.HTTP_200_OK,
    summary="Refresh access token",
    description="Get a new access token using refresh token from HTTP-only cookie.",
)
async def refresh_access_token(
    response: Response,
    db: AsyncSession = Depends(db_dep),
    refresh_token: Optional[str] = Cookie(default=None, alias=REFRESH_TOKEN_COOKIE_NAME),
    refresh_token_request: Optional[RefreshTokenRequest] = Body(default=None),
) -> Token:
    if not refresh_token and not refresh_token_request:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token_to_decode = refresh_token or refresh_token_request.refresh_token
    
    # Decode refresh token
    user_id = decode_refresh_token(token_to_decode)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify user exists
    user = await get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create new access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=access_token_expires
    )
    
    # Optionally rotate refresh token (create new one)
    # refresh_token_expires = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    # new_refresh_token = create_refresh_token(
    #     data={"sub": str(user.id)},
    #     expires_delta=refresh_token_expires
    # )
    
    # Update refresh token in cookie
    response.set_cookie(
        key=REFRESH_TOKEN_COOKIE_NAME,
        value=token_to_decode,
        max_age=REFRESH_TOKEN_COOKIE_MAX_AGE,
        httponly=REFRESH_TOKEN_COOKIE_HTTPONLY,
        secure=REFRESH_TOKEN_COOKIE_SECURE,
        samesite=REFRESH_TOKEN_COOKIE_SAMESITE,
    )
    
    return Token(access_token=access_token, token_type="bearer")


@router.post(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Logout",
    description="Clear refresh token cookie.",
)
async def logout(response: Response) -> None:
    response.delete_cookie(
        key=REFRESH_TOKEN_COOKIE_NAME,
        httponly=REFRESH_TOKEN_COOKIE_HTTPONLY,
        secure=REFRESH_TOKEN_COOKIE_SECURE,
        samesite=REFRESH_TOKEN_COOKIE_SAMESITE,
    )
    response.delete_cookie(
        key=ACCESS_TOKEN_COOKIE_NAME,
        httponly=ACCESS_TOKEN_COOKIE_HTTPONLY,
        secure=ACCESS_TOKEN_COOKIE_SECURE,
        samesite=ACCESS_TOKEN_COOKIE_SAMESITE,
    )
    return None

