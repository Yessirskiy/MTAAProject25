from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.security import OAuth2PasswordRequestForm

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import getSession
from app.db.models.user import User
from app.db.schemas.user_schema import (
    User as UserSchema,  # Name conflict with SQLAlchemy model
    UserReadFull,
)
from app.db.schemas.report_schema import ReportUpdateAdmin, ReportReadFull
from app.db.crud.user_crud import getUserByID, getUserFullByID
from app.db.crud.report_crud import updateReport

from app.dependencies.auth import getUser, getAdmin

from uuid import uuid4

router = APIRouter()


@router.patch("/user/deactivate/{user_id}", summary="Deactivating (soft-deletion) User")
async def deactivateUserRoute(
    user_id: int,
    db: AsyncSession = Depends(getSession),
    admin: User = Depends(getAdmin),
):
    user = await getUserByID(db, user_id, active_only=False)
    if not user:
        raise HTTPException(404, detail="User not found")
    if not user.is_active:
        raise HTTPException(400, detail="User already deactivated")
    user.is_active = False
    await db.commit()
    return Response(status_code=200)


@router.get("/user/{user_id}", response_model=UserReadFull, summary="Get Full User")
async def getUserFullRoute(
    user_id: int,
    db: AsyncSession = Depends(getSession),
    admin: User = Depends(getAdmin),
):
    user = await getUserFullByID(db, user_id, active_only=False)
    if not user:
        raise HTTPException(404, detail="User not found")
    return user


@router.put(
    "/report/{user_id}",
    response_model=ReportReadFull,
    summary="Extensive update of the Report",
)
async def updateReportRoute(
    report_id: int,
    report_update: ReportUpdateAdmin,
    db: AsyncSession = Depends(getSession),
    admin: User = Depends(getAdmin),
):
    try:
        report = await updateReport(db, report_id, report_update)
        return report
    except AssertionError as e:
        if "Report not found" in e.args:
            raise HTTPException(status_code=404, detail="Report not found")
        elif "user ids do not match" in e.args:
            raise HTTPException(status_code=403, detail="No permission to update")
        else:
            print(e)
            raise HTTPException(status_code=500)
