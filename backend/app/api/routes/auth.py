from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db, get_current_user
from app.core.config import settings
from app.core.security import (
    authenticate_user,
    create_access_token,
    get_password_hash,
)
from app.models.user import User
from app.schemas.user import Token, UserCreate, User as UserSchema, LoginRequest
from sqlalchemy import select

router = APIRouter()


@router.post("/register", response_model=UserSchema)
async def register(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Register a new user"""
    
    # Check if user already exists
    stmt = select(User).where(User.email == user_data.email)
    result = await db.execute(stmt)
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="User with this email already exists"
        )
    
    # Check username
    stmt = select(User).where(User.username == user_data.username)
    result = await db.execute(stmt)
    existing_username = result.scalar_one_or_none()
    
    if existing_username:
        raise HTTPException(
            status_code=400,
            detail="Username already taken"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    
    db_user = User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=hashed_password,
        is_active=user_data.is_active,
        is_superuser=user_data.is_superuser
    )
    
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    
    return db_user


@router.post("/login", response_model=Token)
async def login(
    login_data: LoginRequest,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Login and get access token"""
    
    user = await authenticate_user(db, login_data.username, login_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Set token expiration based on remember_me
    if login_data.remember_me:
        # 2 weeks = 14 days = 20160 minutes
        access_token_expires = timedelta(days=14)
    else:
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    access_token = create_access_token(
        subject=user.id, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.get("/me", response_model=UserSchema)
async def read_current_user(
    current_user: User = Depends(get_current_user)
) -> Any:
    """Get current user info"""
    return current_user


@router.post("/test-token", response_model=UserSchema)
async def test_token(
    current_user: User = Depends(get_current_user)
) -> Any:
    """Test access token"""
    return current_user