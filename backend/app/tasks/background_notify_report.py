from sqlalchemy.ext.asyncio import AsyncSession
from app.utils.vision import get_photo_label_and_score
from app.dependencies.common import getSettings
from app.db.models.report import Report, ReportStatus
from app.db.models.vote import Vote
from app.db.base import getSession
from app.db.crud.user_crud import getAllUsers, getUserByID
from app.db.crud.report_crud import getReportByID
from app.db.crud.notifications_crud import createNotification
from app.db.schemas.notification_schema import NotificationCreate


async def notifyReport(report: Report, db: AsyncSession):
    users = await getAllUsers(db, True)
    for user in users:
        if user.settings.is_notification_allowed:
            notification = await createNotification(
                db,
                NotificationCreate(
                    user_id=user.id,
                    report_id=report.id,
                    title="Nová správa vo vašom okolí!",
                    note="Pozrite si správy vo svojej oblasti na domovskej obrazovke.",
                ),
            )


async def notifyVote(report_id: int, db: AsyncSession):
    print("Notifying on report")
    report = await getReportByID(db, report_id)
    user = await getUserByID(db, report.user_id)
    if (
        user
        and report
        and user.settings.is_notification_allowed
        and user.settings.is_onreact_notification
    ):
        notification = await createNotification(
            db,
            NotificationCreate(
                user_id=user.id,
                report_id=report.id,
                title="Práve ste dostali novú reakciu na vašu hlášku!",
                note="Dostali ste kladné hlasovanie o vašej správe.",
            ),
        )
