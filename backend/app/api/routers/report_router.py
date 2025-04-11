from fastapi import APIRouter, Depends, Form, File, UploadFile, HTTPException, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError

from app.db.base import getSession
from app.db.models.user import User
from app.db.models.report import Report
from app.db.schemas.report_schema import (
    ReportCreate,
    Report as ReportSchema,
    ReportPhotoCreate,
    ReportReadFull,
    ReportUpdate,
)
from app.db.crud.report_crud import (
    createReport,
    createReportAddress,
    createReportPhoto,
    getReportByID,
    updateReport,
    deleteReport,
)
from app.dependencies.auth import getUser
from app.dependencies.common import getSettings

import json
import uuid
from pathlib import Path
from typing import Annotated

router = APIRouter()


@router.post("/create", response_model=ReportSchema, summary="Create Report")
async def createReportRoute(
    reportcreatestr: Annotated[
        str, Form()
    ],  # here is the form because the data is sent as multipart/form-data
    photos: Annotated[list[UploadFile], list[File()]],
    db: AsyncSession = Depends(getSession),
    user: User = Depends(getUser),
) -> Report:
    try:  # Creating report + address + photos must be atomic, nocommit=True is obligatory
        # because the data is sent in mutlipart (not application/json)
        # I though of this workaround: get the data as json-string in multipart
        # process it into the pydantic model manually (raise error if format is wrong)
        report_data = json.loads(reportcreatestr)  # str -> dict
        reportcreate = ReportCreate(**report_data)  # dict -> pydantic model
        if not user.is_admin:
            assert reportcreate.user_id == user.id
        created_report = await createReport(db, reportcreate, nocommit=True)
        created_address = await createReportAddress(
            db, reportcreate.address, created_report.id, nocommit=True
        )
        settings = getSettings()
        for photo in photos:
            file_extension = Path(photo.filename).suffix
            # TODO: CHECK THE EXTENSIONS (PHOTOS ONLY)
            filename = f"{uuid.uuid4()}{file_extension}"
            file_path = settings.REPORT_PHOTOS / filename

            with file_path.open("wb") as f:
                f.write(await photo.read())
            await createReportPhoto(
                db,
                ReportPhotoCreate(
                    report_id=created_report.id, filename_path=str(file_path)
                ),
                nocommit=True,
            )
        await db.commit()  # Commit only after all the operations completed
        return created_report
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid ReportCreate Form")
    except AssertionError:
        raise HTTPException(status_code=400, detail="Invalid user_id")
    except Exception as e:
        # TODO: Remove photos from directory if failed sql query
        await db.rollback()
        raise HTTPException(status_code=500, detail="Error creating report")


@router.get("/{report_id}", response_model=ReportReadFull, summary="Retrieve Report")
async def getReportRoute(
    report_id: int,
    db: AsyncSession = Depends(getSession),
    user: User = Depends(getUser),
):
    report = await getReportByID(db, report_id, full=True)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


@router.put("/{report_id}", response_model=ReportReadFull, summary="Update Report")
async def updateReportRoute(
    report_id: int,
    report_update: ReportUpdate,
    db: AsyncSession = Depends(getSession),
    user: User = Depends(getUser),
):
    try:
        report = await updateReport(db, report_id, report_update, user.id)
        return report
    except AssertionError as e:
        if "Report not found" in e.args:
            raise HTTPException(status_code=404, detail="Report not found")
        elif "user ids do not match" in e.args:
            raise HTTPException(status_code=403, detail="No permission to update")
        else:
            print(e)
            raise HTTPException(status_code=500)


@router.delete("/{report_id}", summary="Delete Report")
async def deleteReportRoute(
    report_id: int,
    db: AsyncSession = Depends(getSession),
    user: User = Depends(getUser),
):
    try:
        await deleteReport(db, report_id, user.id)
        return Response(status_code=200)
    except AssertionError as e:
        if "Report not found" in e.args:
            raise HTTPException(status_code=404, detail="Report not found")
        elif "user ids do not match" in e.args:
            raise HTTPException(status_code=403, detail="No permission to update")
        else:
            print(e)
            raise HTTPException(status_code=500)
