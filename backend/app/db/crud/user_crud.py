from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update
from sqlalchemy.orm import joinedload
from app.db.models.user import User
from app.db.schemas.user_schema import UserCreate
import datetime
from typing import Optional
from passlib.hash import bcrypt


async def create_user(db: AsyncSession, user_create: UserCreate) -> User:
    hashed_password = bcrypt.hash(user_create.password)
    new_user = User(
        username=user_create.username,
        email=user_create.email,
        password=hashed_password,
        is_admin=False
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

async def get_user_by_id(db: AsyncSession, user_id: int) -> Optional[User]:
    return await db.get(User, user_id)

async def delete_user(db: AsyncSession, user_id: int) -> None:
    user = await db.get(User, user_id)
    if user:
        await db.delete(user)
        await db.commit()
