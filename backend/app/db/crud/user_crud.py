from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update
from sqlalchemy.orm import joinedload
from app.db.models.user import User
from app.db.schemas.user_schema import UserCreate
from typing import Optional

from app.utils import passwords


async def getUserByID(db: AsyncSession, user_id: int) -> Optional[User]:
    return await db.get(User, user_id)


async def getUserByEmail(db: AsyncSession, user_email: str) -> Optional[User]:
    stmt = select(User).where(User.email == user_email)
    return (await db.scalars(stmt)).one_or_none()


async def createUser(db: AsyncSession, user_create: UserCreate) -> User:
    hashed_password = passwords.hashPassword(
        user_create.password1
    )  # Pydantic model ensures passwords match
    new_user = User(
        first_name=user_create.first_name,
        email=user_create.email,
        hashed_password=hashed_password,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)  # so that user acquires an ID
    return new_user
