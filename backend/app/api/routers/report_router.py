from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError

from app.db.base import getSession
from app.db.models.report import Report
from app.db.schemas.report_schema import ReportCreate, Report
from app.db.crud.report_crud import createReport

router = APIRouter()


@router.post("/create", response_model=Report, summary="Create Report")
async def createReportRoute(
    reportcreate: ReportCreate,
    db: AsyncSession = Depends(getSession),
) -> Report:
    created_cartitem = await createReport(db, reportcreate)
    return created_cartitem
