from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.security import OAuth2PasswordRequestForm

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import getSession
from app.db.models.user import User
from app.db.schemas.user_schema import (
    User as UserSchema,  # Name conflict with SQLAlchemy model
    UserCreate,
    UserUpdate,
    UserAddressCreate,
)
from app.db.schemas.report_schema import UserReports
from app.db.schemas.tokens_schema import TokenSchema
from app.db.schemas.notification_schema import Notification, UserNotifications
from app.db.schemas.settings_schema import UserSettingsRead, UserSettingsUpdate
from app.db.crud.user_crud import *
from app.db.crud.report_crud import getUserReports
from app.db.crud.settings_crud import getSettings, createSettings, updateSettings
from app.db.crud.notifications_crud import getNotificationAll

from app.utils.passwords import verifyPassword
from app.utils.auth import getAccessToken, getRefreshToken
from app.dependencies.auth import getUser

from uuid import uuid4

router = APIRouter()


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
        return settings
    except AssertionError as e:
        if "Settings not found" in e.args[0]:
            raise HTTPException(404, detail="Settings not found")
        elif "Permission denied" in e.args[0]:
            raise HTTPException(403, "Permission denied")
        else:
            print(e)
            raise HTTPException(500)
