from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, func
from sqlalchemy.orm import joinedload, selectinload

from app.db.models.user import User
from app.db.models.report import Report, ReportStatus
from app.db.schemas.user_schema import (
    UserCreate,
    UserUpdate,
    UserChangePassword,
    UserPhotoUpdate,
)
from typing import List, Optional

from app.utils import passwords


async def getUserByID(
    db: AsyncSession, user_id: int, active_only: bool = True
) -> Optional[User]:
    if active_only:
        stmt = (
            select(User)
            .options(joinedload(User.settings))
            .where(User.id == user_id, User.is_active == True)
        )
        return (await db.execute(stmt)).scalars().one_or_none()
    return await db.get(User, user_id)


async def getUserFullByID(
    db: AsyncSession, user_id: int, active_only: bool = True
) -> Optional[User]:
    stmt = (
        select(User)
        .options(
            joinedload(User.settings),
            joinedload(User.address),
        )
        .where(User.id == user_id)
    )
    if active_only:
        stmt = stmt.where(User.is_active == True)
    return (await db.scalars(stmt)).one_or_none()


async def getUserByEmail(
    db: AsyncSession, user_email: str, active_only: bool = True
) -> Optional[User]:
    stmt = select(User).where(User.email == user_email)
    if active_only:
        stmt = stmt.where(User.is_active == True)
    return (await db.scalars(stmt)).one_or_none()


async def createUser(
    db: AsyncSession, user_create: UserCreate, nocommit: bool = False
) -> User:
    hashed_password = passwords.hashPassword(
        user_create.password1
    )  # Pydantic model ensures passwords match
    new_user = User(
        first_name=user_create.first_name,
        email=user_create.email,
        hashed_password=hashed_password,
    )
    db.add(new_user)
    if not nocommit:
        await db.commit()
        await db.refresh(new_user)
        return new_user
    await db.flush()
    return new_user


async def updateUser(
    db: AsyncSession,
    user_id: int,
    user_update: UserUpdate,
) -> Optional[User]:
    user = await getUserByID(db, user_id)
    assert user is not None, "User not found"
    new_data = user_update.model_dump(exclude_none=True, exclude=("string",))
    for key, value in new_data.items():
        setattr(user, key, value)
    await db.commit()
    await db.refresh(user)
    return user


async def updateUserPassword(
    db: AsyncSession,
    user_id: int,
    changePassword: UserChangePassword,
) -> Optional[User]:
    user = await getUserByID(db, user_id)
    assert user is not None, "User not found"
    if not passwords.verifyPassword(changePassword.old_password, user.hashed_password):
        raise ValueError("Old password is incorrect")
    user.hashed_password = passwords.hashPassword(changePassword.new_password2)
    await db.commit()
    await db.refresh(user)
    return user


async def updateUserPhoto(db: AsyncSession, update_photo: UserPhotoUpdate):
    user = await getUserByID(db, update_photo.user_id)
    assert user is not None, "User not found"
    user.picture_path = update_photo.picture_path
    await db.commit()
    await db.refresh(user)


async def getUserStatistics(db: AsyncSession, user_id: int):
    stmt = select(
        func.count().filter(Report.user_id == user_id).label("reported_count"),
        func.count()
        .filter((Report.user_id == user_id) & (Report.status == ReportStatus.resolved))
        .label("resolved_count"),
    )

    result = await db.execute(stmt)
    reported_count, resolved_count = result.one()
    return {"reported_count": reported_count, "resolved_count": resolved_count}


async def getAllUsers(db: AsyncSession, active_only: bool = True) -> List[User]:
    stmt = select(User).options(joinedload(User.settings))
    if active_only:
        stmt = stmt.where(User.is_active == True)
    result = await db.execute(stmt)
    return result.scalars().all()
