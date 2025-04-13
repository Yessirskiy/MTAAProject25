from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.models.user import UserAddress, UserAddress
from app.db.schemas.address_schema import (
    UserAddressCreate,
    UserAddressUpdate,
)
from typing import Optional


async def getAddress(db: AsyncSession, user_id: int) -> Optional[UserAddress]:
    stmt = select(UserAddress).where(UserAddress.user_id == user_id)
    return (await db.scalars(stmt)).one_or_none()


async def createAddress(
    db: AsyncSession, user_id: int, nocommit: bool = True
) -> UserAddress:
    user_address_create = UserAddressCreate(user_id=user_id)
    data = user_address_create.model_dump()
    new_address = UserAddress(**data)
    db.add(new_address)
    if not nocommit:
        await db.commit()
        await db.refresh(new_address)
        return new_address
    await db.flush()
    return new_address


async def updateAddress(
    db: AsyncSession,
    user_id: int,
    user_address: UserAddressUpdate,
) -> Optional[UserAddress]:
    address = await getAddress(db, user_id)
    assert address is not None, "Address not found"
    new_data = user_address.model_dump(exclude_none=True)
    for key, value in new_data.items():
        setattr(address, key, value)
    await db.commit()
    await db.refresh(address)
    return address
