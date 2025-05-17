from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import getSession

from app.db.schemas.settings_schema import UserSettingsRead, UserSettingsUpdate
from app.db.crud.settings_crud import getSettings, createSettings, updateSettings

from app.db.models.user import User
from app.dependencies.auth import getUser

router = APIRouter()


@router.get(
    "/me",
    summary="Retrieve Authenticated User's settings",
    response_model=UserSettingsRead,
)
async def getSettingsNotificationsMeRoute(
    db: AsyncSession = Depends(getSession), user: User = Depends(getUser)
):
    try:
        settings = await getSettings(db, user.id)
        assert settings is not None, "Settings not found"
        return settings
    except AssertionError as e:
        if "Settings not found" in e.args[0]:
            raise HTTPException(404, detail="Settings not found")
        elif "Permission denied" in e.args[0]:
            raise HTTPException(403, "Permission denied")
        else:
            print(e)
            raise HTTPException(500)


@router.put(
    "/me",
    summary="Update Authenticated User's settings",
    response_model=UserSettingsRead,
)
async def updateSettingsNotificationsMeRoute(
    settings_update: UserSettingsUpdate,
    db: AsyncSession = Depends(getSession),
    user: User = Depends(getUser),
):
    try:
        settings = await updateSettings(db, user.id, settings_update)
        assert settings is not None, "Settings not found"
        return settings
    except AssertionError as e:
        if "Settings not found" in e.args[0]:
            raise HTTPException(404, detail="Settings not found")
        elif "Permission denied" in e.args[0]:
            raise HTTPException(403, "Permission denied")
        else:
            print(e)
            raise HTTPException(500)


@router.get(
    "/{user_id}", summary="Retrieve User's settings", response_model=UserSettingsRead
)
async def getSettingsRoute(
    user_id: int,
    db: AsyncSession = Depends(getSession),
    user: User = Depends(getUser),
):
    try:
        if not user.is_admin:
            assert user.id == user_id, "Permission denied"
        settings = await getSettings(db, user_id)
        assert settings is not None, "Settings not found"
        return settings
    except AssertionError as e:
        if "Settings not found" in e.args[0]:
            raise HTTPException(404, detail="Settings not found")
        elif "Permission denied" in e.args[0]:
            raise HTTPException(403, "Permission denied")
        else:
            print(e)
            raise HTTPException(500)


@router.put(
    "/{user_id}",
    summary="Update User's settings",
    response_model=UserSettingsRead,
)
async def updateSettingsRoute(
    user_id: int,
    settings_update: UserSettingsUpdate,
    db: AsyncSession = Depends(getSession),
    user: User = Depends(getUser),
):
    try:
        if not user.is_admin:
            assert user.id == user_id, "Permission denied"
        settings = await updateSettings(db, user_id, settings_update)
        assert settings is not None, "Settings not found"
        return settings
    except AssertionError as e:
        if "Settings not found" in e.args[0]:
            raise HTTPException(404, detail="Settings not found")
        elif "Permission denied" in e.args[0]:
            raise HTTPException(403, "Permission denied")
        else:
            print(e)
            raise HTTPException(500)
