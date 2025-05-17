from sqlalchemy.ext.asyncio import AsyncSession
from app.utils.vision import get_photo_label_and_score
from app.dependencies.common import getSettings
from app.db.models.report import Report, ReportStatus
from app.db.base import getSession


async def assessReport(report: Report, db: AsyncSession):
    print("Asses report started")
    settings = getSettings()
    inappropriate_found = False
    for photo in report.photos:
        labels, score, is_inappropriate = await get_photo_label_and_score(
            str(settings.REPORT_PHOTOS / photo.filename_path)
        )
        photo.ai_score = score
        photo.ai_labels = labels
        db.add(photo)

        print(
            f"[PHOTO {photo.id}] Labels: {labels}\nScore: {score}\nIs inappropriate: {is_inappropriate}"
        )
        if is_inappropriate:
            inappropriate_found = True
    if inappropriate_found:
        report.status = ReportStatus.cancelled
        report.admin_note = "Jeden z vložených obrázkov bol automaticky ohodnotený ako nevhodný. Čaká sa na kontrolu správcom."
        db.add(report)
    await db.commit()
