from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload
from sqlalchemy import desc, func
from app.db.models.report import Report, ReportStatus, ReportAddress, ReportPhoto
from app.db.models.user import User
from app.db.schemas.report_schema import (
    ReportCreate,
    ReportAddressCreate,
    ReportPhotoCreate,
    ReportUpdate,
)
from typing import Optional


async def getReportByID(
    db: AsyncSession, report_id: int, full: bool = False
) -> Optional[Report]:
    if not full:
        return await db.get(Report, report_id)
    stmt = (
        select(Report)
        .options(
            joinedload(Report.address),
            joinedload(Report.user).joinedload(User.settings),
            joinedload(Report.photos),
        )
        .where(Report.id == report_id)
    )
    return (await db.execute(stmt)).scalars().unique().one_or_none()


async def getUserReports(db: AsyncSession, user_id: int) -> list[Report]:
    stmt = (
        select(Report)
        .options(
            joinedload(Report.address),
            joinedload(Report.user).joinedload(User.settings),
            joinedload(Report.photos),
        )
        .where(Report.user_id == user_id)
    )
    return (await db.execute(stmt)).scalars().unique().all()


async def createReport(
    db: AsyncSession, report_create: ReportCreate, nocommit: bool = True
) -> Report:
    data = report_create.model_dump(exclude_none=True, exclude={"address"})
    new_report = Report(**data)
    db.add(new_report)
    if not nocommit:
        await db.commit()
        await db.refresh(new_report)
        return new_report
    await db.flush()
    return new_report


async def updateReport(
    db: AsyncSession,
    report_id: int,
    report_update: ReportUpdate,
    check_user_id: int = None,
) -> Optional[Report]:
    report = await getReportByID(db, report_id, full=True)
    assert report is not None, "Report not found"
    if check_user_id:
        assert report.user_id == check_user_id, "user ids do not match"
    new_data = report_update.model_dump(exclude_none=True)
    for key, value in new_data.items():
        if key == "address":
            for addr_key, addr_value in value.items():
                setattr(report.address, addr_key, addr_value)
        else:
            setattr(report, key, value)
    await db.commit()
    await db.refresh(report)
    return report


async def deleteReport(
    db: AsyncSession,
    report_id: int,
    check_user_id: int = None,
) -> None:
    report = await db.get(Report, report_id)
    assert report is not None, "Report not found"
    if check_user_id:
        assert report.user_id == check_user_id, "user ids do not match"
    await db.delete(report)
    await db.commit()


async def createReportAddress(
    db: AsyncSession,
    address_create: ReportAddressCreate,
    report_id: int,
    nocommit: bool = True,
):
    data = address_create.model_dump(exclude_none=True)
    new_address = ReportAddress(report_id=report_id, **data)
    db.add(new_address)
    if not nocommit:
        await db.commit()
        await db.refresh(new_address)
        return new_address
    await db.flush()
    return new_address


async def createReportPhoto(
    db: AsyncSession, photo_create: ReportPhotoCreate, nocommit: bool = True
):
    data = photo_create.model_dump(exclude_none=True)
    new_photo = ReportPhoto(**data)
    db.add(new_photo)
    if not nocommit:
        await db.commit()
        await db.refresh(new_photo)
        return new_photo
    await db.flush()
    return new_photo


async def getReportPhoto(db: AsyncSession, photo_id: int):
    return await db.get(ReportPhoto, photo_id)


async def getFeedReports(db: AsyncSession, admin_view: bool = False) -> list[Report]:
    stmt = (
        select(Report)
        .outerjoin(ReportPhoto, Report.id == ReportPhoto.report_id)
        .options(
            joinedload(Report.address),
            joinedload(Report.user).joinedload(User.settings),
            joinedload(Report.photos),
        )
        .group_by(Report.id)
        .order_by(
            desc(func.coalesce(func.sum(ReportPhoto.ai_score), 0)),
            Report.published_datetime,
        )
    )
    if not admin_view:
        stmt = stmt.where(
            Report.status.in_([ReportStatus.published, ReportStatus.in_progress])
        )
    return (await db.execute(stmt)).scalars().unique().all()
