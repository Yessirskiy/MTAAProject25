from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.models.user import User, UserAddress
from app.db.schemas.user_schema import (
    UserCreate,
    UserAddressCreate,
    UserAddress,
    UserUpdate,
)
from typing import Optional

from app.utils import passwords


async def getUserByID(
    db: AsyncSession, user_id: int, active_only: bool = True
) -> Optional[User]:
    if active_only:
        stmt = select(User).where(User.id == user_id, User.is_active == 1)
        return (await db.scalars(stmt)).one_or_none()
    return await db.get(User, user_id)


async def getUserByEmail(db: AsyncSession, user_email: str) -> Optional[User]:
    stmt = select(User).where(User.email == user_email)
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


async def createUserAddress(
    db: AsyncSession,
    address_create: UserAddressCreate,
    user_id: int,
    nocommit: bool = True,
) -> UserAddress:
    data = address_create.model_dump(exclude_none=True)
    new_address = UserAddress(user_id=user_id, **data)
    db.add(new_address)
    if not nocommit:
        await db.commit()
        await db.refresh(new_address)
        return new_address
    await db.flush()
    return new_address


async def updateUser(
    db: AsyncSession,
    user_id: int,
    user_update: UserUpdate,
) -> Optional[User]:
    user = await getUserByID(db, user_id)
    assert user is not None, "User not found"
    new_data = user_update.model_dump(exclude_none=True)
    for key, value in new_data.items():
        if key == "address":
            for addr_key, addr_value in value.items():
                setattr(user.address, addr_key, addr_value)
        else:
            setattr(user, key, value)
    await db.commit()
    await db.refresh(user)
    return user
