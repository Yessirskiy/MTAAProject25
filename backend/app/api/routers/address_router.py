from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import getSession

from app.db.schemas.address_schema import UserAddressRead, UserAddressUpdate
from app.db.crud.address_crud import getAddress, createAddress, updateAddress

from app.db.models.user import User
from app.dependencies.auth import getUser

router = APIRouter()


@router.get(
    "/{user_id}", summary="Retrieve User's address", response_model=UserAddressRead
)
async def getAddressRoute(
    user_id: int,
    db: AsyncSession = Depends(getSession),
    user: User = Depends(getUser),
):
    try:
        if not user.is_admin:
            assert user.id == user_id, "Permission denied"
        address = await getAddress(db, user_id)
        assert address is not None, "Address not found"
        return address
    except AssertionError as e:
        if "Address not found" in e.args[0]:
            raise HTTPException(404, detail="Address not found")
        elif "Permission denied" in e.args[0]:
            raise HTTPException(403, "Permission denied")
        else:
            print(e)
            raise HTTPException(500)


@router.put(
    "/{user_id}",
    summary="Update User's address",
    response_model=UserAddressRead,
)
async def updateAddressRoute(
    user_id: int,
    address_update: UserAddressUpdate,
    db: AsyncSession = Depends(getSession),
    user: User = Depends(getUser),
):
    try:
        if not user.is_admin:
            assert user.id == user_id, "Permission denied"
        address = await updateAddress(db, user_id, address_update)
        return address
    except AssertionError as e:
        if "Address not found" in e.args[0]:
            raise HTTPException(404, detail="Address not found")
        elif "Permission denied" in e.args[0]:
            raise HTTPException(403, "Permission denied")
        else:
            print(e)
            raise HTTPException(500)
