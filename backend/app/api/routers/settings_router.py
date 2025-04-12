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
from app.db.crud.settings_crud import getSettings, createSettings
from app.db.crud.notifications_crud import getNotificationAll

from app.utils.passwords import verifyPassword
from app.utils.auth import getAccessToken, getRefreshToken
from app.dependencies.auth import getUser

from uuid import uuid4

router = APIRouter()


