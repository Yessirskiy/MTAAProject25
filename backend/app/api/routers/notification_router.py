from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import getSession
from app.db.models.user import User
from app.db.schemas.notification_schema import (
    Notification as NotificationSchema,  # Name conflict with SQLAlchemy model
    NotificationCreate,
)
from app.db.crud.notifications_crud import (
    createNotification,
    getNotification,
    markNotificationAsRead,
    deleteNotification,
)
from app.dependencies.auth import getUser, getAdmin

router = APIRouter()


@router.post(
    "/create",
    summary="Create Notification",
    response_model=NotificationSchema,
)
async def createNotificationRoute(
    user_id: int,
    report_id: int,
    title: str,
    note: str,
    db: AsyncSession = Depends(getSession),
    admin: User = Depends(getAdmin),
):
    return await createNotification(
        db,
        create_notification=NotificationCreate(
            user_id=user_id, report_id=report_id, title=title, note=note
        ),
    )


@router.get(
    "/{notification_id}",
    summary="Retrieve Notification",
    response_model=NotificationSchema,
)
async def getNotificationRoute(
    notification_id: int,
    user: User = Depends(getUser),
    db: AsyncSession = Depends(getSession),
):
    notification = await getNotification(db, notification_id, user.id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notification


@router.put(
    "/{notification_id}",
    summary="Mark Notification as read",
    response_model=NotificationSchema,
)
async def markNotificationAsReadRoute(
    notification_id: int,
    user: User = Depends(getUser),
    db: AsyncSession = Depends(getSession),
):
    notification = await markNotificationAsRead(db, notification_id, user.id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notification


@router.delete(
    "/{notification_id}",
    summary="Delete a notification",
    response_model=NotificationSchema,
)
async def deleteNotificationRoute(
    notification_id: int,
    db: AsyncSession = Depends(getSession),
    user: User = Depends(getUser),
):
    notification = await deleteNotification(db, notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notification
