from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update
from sqlalchemy.orm import joinedload
from app.db.models.report import Report, ReportAddress, ReportPhoto
from app.db.schemas.report_schema import (
    ReportCreate,
    ReportAddressCreate,
    ReportPhotoCreate,
    ReportUpdate,
)
import datetime
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
            joinedload(Report.user),
            joinedload(Report.photos),
        )
        .where(Report.id == report_id)
    )
    return (await db.execute(stmt)).scalars().unique().one_or_none()


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
    if report:
        if check_user_id:
            assert report.user_id == check_user_id
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


async def deleteReport(db: AsyncSession, report_id: int) -> None:
    report = db.get(Report, report_id)
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
