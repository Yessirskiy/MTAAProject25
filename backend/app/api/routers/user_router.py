from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.security import OAuth2PasswordRequestForm

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import getSession
from app.db.models.user import User
from app.db.schemas.user_schema import (
    User as UserSchema,  # Name conflict with SQLAlchemy model
    UserRead,
    UserCreate,
    UserUpdate,
)
from app.db.schemas.report_schema import UserReports
from app.db.schemas.tokens_schema import TokenSchema, AccessTokenSchema
from app.db.schemas.notification_schema import UserNotifications
from app.db.crud.user_crud import *
from app.db.crud.report_crud import getUserReports
from app.db.crud.settings_crud import createSettings
from app.db.crud.address_crud import createAddress
from app.db.crud.notifications_crud import getNotificationAll

from app.utils.passwords import verifyPassword
from app.utils.auth import getAccessToken, getRefreshToken
from app.dependencies.auth import getUser, refreshUser

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
    try:
        created_user = await createUser(db, usercreate, nocommit=True)
        created_settings = await createSettings(db, created_user.id, nocommit=True)
        created_address = await createAddress(db, created_user.id, nocommit=True)
        await db.commit()
        return Response(status_code=200)
    except Exception as e:
        await db.rollback()
        print(e)
        raise HTTPException(status_code=500, detail="Error creating User")


@router.post(
    "/login",
    summary="Create access and refresh tokens for user",
    response_model=TokenSchema,
)
async def loginRoute(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(getSession),
):
    user = await getUserByEmail(db, form_data.username)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not verifyPassword(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    return TokenSchema(
        access_token=getAccessToken(user.id),
        refresh_token=getRefreshToken(user.id),
    )


@router.post("/refresh", summary="Refresh access token for the User")
async def refreshAccessRoute(
    refresh_token: str,
    refresh_user: User = Depends(refreshUser),
):
    new_access_token = getAccessToken(refresh_user.id)
    return AccessTokenSchema(access_token=new_access_token)


@router.get(
    "/me",
    summary="Get details of currently logged in user",
    response_model=UserRead,
)
async def getMeRoute(
    db: AsyncSession = Depends(getSession), user: User = Depends(getUser)
):
    # user = await getUserByID(db, user.id, active_only=True)
    # if not user:
    #     raise HTTPException(
    #         status_code=404,
    #         detail="User not found",
    #     )
    return user


@router.put(
    "/me",
    summary="Update details of currently logged in user",
    response_model=UserUpdate,
)
async def updateMeRoute(
    user_update: UserUpdate,
    db: AsyncSession = Depends(getSession),
    user: User = Depends(getUser),
):
    try:
        user = await updateUser(db, user.id, user_update)
        return user
    except AssertionError as e:
        if "User not found" in e.args[0]:
            raise HTTPException(404, detail="User not found")
        elif "Permission denied" in e.args[0]:
            raise HTTPException(403, "Permission denied")
        else:
            print(e)
            raise HTTPException(500)


@router.delete(
    "/me",
    summary="Deactivate (soft-deletion) currently logged in user",
)
async def deleteMeRoute(
    db: AsyncSession = Depends(getSession),
    user: User = Depends(getUser),
):
    try:
        user = await getUserByID(db, user.id)
        user.is_active = False
        await db.commit()
        return Response(status_code=200)
    except AssertionError as e:
        if "User not found" in e.args[0]:
            raise HTTPException(404, detail="User not found")
        elif "Permission denied" in e.args[0]:
            raise HTTPException(403, "Permission denied")
        else:
            print(e)
            raise HTTPException(500)


@router.put(
    "/change-password",
    summary="Change logged in User password",
    response_model=UserChangePassword,
)
async def changeUserPasswordRoute(
    changePassword: UserChangePassword,
    db: AsyncSession = Depends(getSession),
    user: User = Depends(getUser),
):
    await updateUserPassword(db, user.id, changePassword)
    return Response(status_code=200)


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
    "/notifications",
    summary="Retrieve User's notifications",
    response_model=UserNotifications,
)
async def getUserNotificationsRoute(
    db: AsyncSession = Depends(getSession), user: User = Depends(getUser)
):
    notifications = await getNotificationAll(db, user.id)
    return UserNotifications(data=notifications)
