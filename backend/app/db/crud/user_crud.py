from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update
from sqlalchemy.orm import joinedload
from app.db.models.user import User
from app.db.schemas.user_schema import UserCreate
import datetime
from typing import Optional


async def create_user(db: AsyncSession, user_create: UserCreate) -> User:
    data = user_create.model_dump(exclude_none=True)
    new_user = User(**data)
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user
