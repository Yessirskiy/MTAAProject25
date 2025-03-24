from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update
from sqlalchemy.orm import joinedload
from app.db.models.report import Report
from app.db.schemas.report_schema import ReportCreate
import datetime
from typing import Optional


async def get_report_by_id(db: AsyncSession, report_id: int) -> Optional[Report]:
    return await db.get(Report, report_id)


async def create_report(db: AsyncSession, report_create: ReportCreate) -> Report:
    data = report_create.model_dump(exclude_none=True)
    new_report = Report(**data)
    db.add(new_report)
    await db.commit()
    await db.refresh(new_report)
    return new_report

async def update_report(db: AsyncSession, report_id: int, new_data: dict) -> Optional[Report]:
    report = await db.get(Report, report_id)
    if report:
        for key, value in new_data.items():
            setattr(report, key, value)
        await db.commit()
        await db.refresh(report)
    return report

async def dekete_report(db: AsyncSession, report_id:int) -> None:
    report = db.get(Report, report_id)
    await db.delete(report)
    await db.commit()
