from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, update
from app.db.models.user import Notification
from app.db.schemas.notification_schema import (
    NotificationCreate,
)
from typing import Optional, List


async def createNotification(
    db: AsyncSession, create_notification: NotificationCreate
) -> Notification:
    data = create_notification.model_dump(exclude_none=True)
    new_notification = Notification(**data)
    db.add(new_notification)
    await db.commit()
    await db.refresh(new_notification)
    return new_notification


async def getNotification(
    db: AsyncSession, notification_id: int, user_id: int
) -> Optional[Notification]:
    stmt = select(Notification).where(
        Notification.id == notification_id,
        Notification.user_id == user_id,
    )
    return (await db.scalars(stmt)).one_or_none()


async def getNotificationAll(db: AsyncSession, user_id: int) -> List[Notification]:
    stmt = (
        select(Notification)
        .where(Notification.user_id == user_id)
        .order_by(Notification.sent_datetime.desc())
    )
    return (await db.scalars(stmt)).all()


async def markNotificationAsRead(
    db: AsyncSession, notification_id: int, user_id: int
) -> Optional[Notification]:
    stmt = (
        update(Notification)
        .where(Notification.id == notification_id, Notification.user_id == user_id)
        .values(read_datetime=func.now())
    )
    await db.execute(stmt)
    await db.commit()
    return await getNotification(db, notification_id, user_id)


async def deleteNotification(
    db: AsyncSession, notification_id: int
) -> Optional[Notification]:
    notification = await db.get(Notification, notification_id)
    assert notification is not None, "Notification not found"
    await db.delete(notification)
    await db.commit()
    return notification
