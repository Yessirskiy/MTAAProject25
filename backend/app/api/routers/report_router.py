from fastapi import (
    APIRouter,
    Depends,
    Form,
    File,
    UploadFile,
    HTTPException,
    Response,
    BackgroundTasks,
)
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError

from app.db.base import getSession
from app.db.models.user import User
from app.db.models.report import Report, ReportStatus
from app.db.schemas.report_schema import (
    ReportCreate,
    Report as ReportSchema,
    ReportPhotoCreate,
    ReportReadFull,
    ReportUpdate,
    FeedReports,
)
from app.db.crud.report_crud import (
    createReport,
    createReportAddress,
    createReportPhoto,
    getReportByID,
    updateReport,
    deleteReport,
    getReportPhoto,
    getFeedReports,
)
from app.dependencies.auth import getUser
from app.dependencies.common import getSettings

from app.websockets.update_report import manager as updateReportManager
from app.tasks.background_assess_report import assessReport

import os
import json
import uuid
from pathlib import Path
from typing import Annotated


router = APIRouter()


@router.post("/create", response_model=ReportReadFull, summary="Create Report")
async def createReportRoute(
    reportcreatestr: Annotated[
        str, Form()
    ],  # here is the form because the data is sent as multipart/form-data
    background_tasks: BackgroundTasks,
    photos: Annotated[list[UploadFile], File()],
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
        # inappropriate_found = False

        for photo in photos:
            file_extension = Path(photo.filename).suffix
            # TODO: CHECK THE EXTENSIONS (PHOTOS ONLY)

            file_path = f"{uuid.uuid4()}{file_extension}"
            # file_path = settings.REPORT_PHOTOS / filename
            # The problem occured here. When you run locally (in dev env),
            # It stores absolute path in the database, but this absolute path
            # Is not the same for the isolated env (e.g. docker), and it cannot
            # Locate the files anymore. so we save only name of the file
            # And re-build absolute path (env-wise) when writings/retrieving photos

            with (settings.REPORT_PHOTOS / file_path).open("wb") as f:
                f.write(await photo.read())

            # labels, score, is_inappropriate = await get_photo_label_and_score(
            #     str(settings.REPORT_PHOTOS / file_path)
            # )
            # print(
            #     f"Labels: {labels}\nScore: {score}\nIs inappropriate: {is_inappropriate}"
            # )

            # if is_inappropriate:
            #     inappropriate_found = True

            await createReportPhoto(
                db,
                ReportPhotoCreate(
                    report_id=created_report.id,
                    filename_path=str(file_path),
                    # ai_score=score,
                    # ai_labels=labels,
                ),
                nocommit=True,
            )

        # If any photo was inappropriate, update the report status and admin note
        # if inappropriate_found:
        #     created_report.status = ReportStatus.cancelled
        #     created_report.admin_note = "Jeden z vložených obrázkov bol automaticky ohodnotený ako nevhodný. Čaká sa na kontrolu správcom."
        #     await db.flush()

        await db.commit()  # Commit only after all the operations completed
        # to obtain full info, we have to make one more request to DB
        report = await getReportByID(db, created_report.id, full=True)
        if report:
            background_tasks.add_task(assessReport, report=report, db=db)
        return report
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid ReportCreate Form")
    except AssertionError:
        raise HTTPException(status_code=400, detail="Invalid user_id")
    except Exception as e:
        # TODO: Remove photos from directory if failed sql query
        await db.rollback()
        raise HTTPException(status_code=500, detail="Error creating Report")


@router.get("/feed", response_model=FeedReports, summary="Retrieve Reports Feed")
async def getReportsFeedRoute(
    db: AsyncSession = Depends(getSession), user: User = Depends(getUser)
):
    if user.is_admin:
        reports = await getFeedReports(db, admin_view=True)
    else:
        reports = await getFeedReports(db, admin_view=False)
    return {"data": reports}


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
        try:
            await updateReportManager.broadcastUpdateReport({"report_id": report_id})
        except Exception as e:
            print("Error while broadcasting report to WS: ", e)
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


@router.get(
    "/photo/{photo_id}", response_class=FileResponse, summary="Retrieve Report Photo"
)
async def getReportPhotoRoute(
    photo_id: int, db: AsyncSession = Depends(getSession), user: User = Depends(getUser)
):
    photo = await getReportPhoto(db, photo_id)
    if photo is None:
        raise HTTPException(404, "Photo not found")
    settings = getSettings()
    full_path = settings.REPORT_PHOTOS / photo.filename_path
    if not os.path.exists(full_path):
        raise HTTPException(500)
    return FileResponse(full_path)
