from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import getSession
from app.db.models.user import User
from app.db.schemas.user_schema import (
    User as UserSchema, # Name conflict with SQLAlchemy model
    UserCreate,
    UserUpdate,
    UserAddressCreate,
    UserSettings,
    Notification as NotificationSchema, # Name conflict with SQLAlchemy model
    NotificationCreate
)
from app.db.schemas.report_schema import UserReports
from app.db.schemas.tokens_schema import TokenSchema
from app.db.crud.user_crud import *
from app.db.crud.report_crud import getUserReports

from app.utils.passwords import verifyPassword
from app.utils.auth import getAccessToken, getRefreshToken
from app.dependencies.auth import getUser

from uuid import uuid4

router = APIRouter()


@router.post("/signup", response_model=UserSchema, summary="Signup User")
async def signupUserRoute(
    usercreate: UserCreate,
    db: AsyncSession = Depends(getSession),
) -> User:
    exists = await getUserByEmail(db, usercreate.email)
    if exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already in use",
        )
    created_user = await createUser(db, usercreate)
    return created_user


@router.post(
    "/login",
    summary="Create access and refresh tokens for user",
    response_model=TokenSchema,
)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(getSession),
):
    user = await getUserByEmail(db, form_data.username)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email or password",
        )

    if not verifyPassword(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password",
        )

    return {
        "access_token": getAccessToken(user.email),
        "refresh_token": getRefreshToken(user.email),
    }


@router.get(
    "/me", summary="Get details of currently logged in user", response_model=UserSchema
)
async def getMe(user: User = Depends(getUser)):
    return user


@router.get(
    "/reports",
    summary="Get reports of currently logged in user",
    response_model=UserReports,
)
async def getUserReportsRoute(
    db: AsyncSession = Depends(getSession), user: User = Depends(getUser)
):
    reports = await getUserReports(db, user.id)
    return {"data": reports}

@router.get(
    "/settings",
    summary="Get settings of currently logged in user if they exist, if not, create default settings (everything is false)",
    response_model=UserSettings,
)
async def getUserSettingsRoute(
    db: AsyncSession = Depends(getSession), user: User = Depends(getUser)
):
    settings = await getOrSetUserSettings(db, user.id)
    if not settings:
        settings = await createUserSettings(db, user.id)
    return settings

@router.post(
    "/notifications/create",
    summary="Create a new notification for the user",
    response_model=NotificationSchema,
)
async def createNotificationRoute(
    user_id: int,
    report_id: int,
    title: str,
    note: str,
    db: AsyncSession = Depends(getSession)
):
    return await createNotification(db, create_notification=NotificationCreate(user_id=user_id, report_id=report_id, title=title, note=note))

@router.get(
    "/notifications/get/one",
    summary="Get a notification by ID for the user",
    response_model=NotificationSchema,
)
async def getNotificationRoute(
    notification_id: int,
    user: User = Depends(getUser),
    db: AsyncSession = Depends(getSession)
):
    notification = await getUserNotification(db, notification_id, user.id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notification

@router.get(
    "/notifications/get/all",
    summary="Get all notifications for the user",
    response_model=list[NotificationSchema],
)
async def getAllNotificationsRoute(
    user: User = Depends(getUser),
    db: AsyncSession = Depends(getSession)
):
    return await getAllUserNotifications(db, user.id)

@router.put(
    "/notifications/markAsRead",
    summary="Mark a notification as read",
    response_model=NotificationSchema,
)
async def markNotificationAsReadRoute(
    notification_id: int,
    user: User = Depends(getUser),
    db: AsyncSession = Depends(getSession)
):
    notification = await markNotificationAsRead(db, notification_id, user.id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notification

@router.delete(
    "/notifications/delete",
    summary="Delete a notification",
    response_model=NotificationSchema,
)
async def deleteNotificationRoute(
    notification_id: int,
    db: AsyncSession = Depends(getSession)
):
    notification = await deleteNotification(db, notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notification
