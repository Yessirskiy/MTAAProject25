from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update
from sqlalchemy.orm import joinedload
from app.db.models.report import Report
from app.db.schemas.report_schema import ReportCreate
import datetime
from typing import Optional


async def getReportByID(db: AsyncSession, report_id: int) -> Optional[Report]:
    query = select(Report).where(Report.id == report_id)
    result = await db.execute(query)
    return result.unique().scalar()


async def createReport(db: AsyncSession, report_create: ReportCreate) -> Report:
    data = report_create.model_dump(exclude_none=True)
    new_report = Report(**data)
    db.add(new_report)
    await db.commit()
    await db.refresh(new_report)
    return new_report
