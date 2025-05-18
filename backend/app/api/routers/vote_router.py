from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
import asyncpg

from app.db.base import getSession
from app.db.models.user import User
from app.db.schemas.vote_schema import VoteCreate, VoteRead, VoteUpdate
from app.db.crud.vote_crud import createVote, getVote, updateVote, deleteVote
from app.dependencies.auth import getUser
from app.websockets.update_report import manager as updateReportManager

router = APIRouter()


@router.post("/create", response_model=VoteRead, summary="Create Vote")
async def createVoteRoute(
    vote_create: VoteCreate,
    db: AsyncSession = Depends(getSession),
    user: User = Depends(getUser),
):
    try:
        if not user.is_admin and (not vote_create.user_id == user.id):
            raise HTTPException(status_code=403, detail="No permission to create")
        created_vote = await createVote(db, vote_create)
        try:
            await updateReportManager.broadcastUpdateReport(
                {"report_id": vote_create.report_id}
            )
        except Exception as e:
            print("Error while broadcasting report to WS: ", e)
        return created_vote
    except IntegrityError as e:
        if isinstance(e.orig.__cause__, asyncpg.exceptions.UniqueViolationError):
            raise HTTPException(status_code=400, detail="Vote is not unique")
        elif isinstance(e.orig.__cause__, asyncpg.exceptions.ForeignKeyViolationError):
            raise HTTPException(status_code=404, detail="Referenced Report not found")
        else:
            raise HTTPException(status_code=500)


@router.get("", response_model=VoteRead, summary="Retrieve Vote")
async def getVoteRoute(
    user_id: int,
    report_id: int,
    db: AsyncSession = Depends(getSession),
    user: User = Depends(getUser),
):
    try:
        if not user.is_admin:
            assert user.id == user_id, "user ids do not match"
        vote = await getVote(db, user_id, report_id)
        assert vote is not None, "Vote not found"
        return vote
    except AssertionError as e:
        if "Vote not found" in e.args[0]:
            raise HTTPException(404, detail="Vote not found")
        elif "user ids do not match" in e.args:
            raise HTTPException(status_code=403, detail="No permission to retrieve")
        else:
            print(e)
            raise HTTPException(status_code=500)


@router.patch("", response_model=VoteRead, summary="Patch Vote")
async def patchVoteRoute(
    vote_update: VoteUpdate,
    db: AsyncSession = Depends(getSession),
    user: User = Depends(getUser),
):
    try:
        if not user.is_admin:
            assert user.id == vote_update.user_id, "user ids do not match"
        updated_vote = await updateVote(db, vote_update)
        try:
            await updateReportManager.broadcastUpdateReport(
                {"report_id": vote_update.report_id}
            )
        except Exception as e:
            print("Error while broadcasting report to WS: ", e)
        return updated_vote
    except AssertionError as e:
        if "Vote not found" in e.args:
            raise HTTPException(status_code=404, detail="Vote not found")
        elif "user ids do not match" in e.args:
            raise HTTPException(status_code=403, detail="No permission to update")
        else:
            print(e)
            raise HTTPException(status_code=500)


@router.delete(f"", summary="Delete Vote")
async def deleteVoteRoute(
    user_id: int,
    report_id: int,
    db: AsyncSession = Depends(getSession),
    user: User = Depends(getUser),
):
    try:
        if not user.is_admin:
            assert user.id == user_id, "user ids do not match"
        await deleteVote(db, user_id, report_id)
        try:
            await updateReportManager.broadcastUpdateReport({"report_id": report_id})
        except Exception as e:
            print("Error while broadcasting report to WS: ", e)
        return Response(status_code=200)
    except AssertionError as e:
        if "Vote not found" in e.args:
            raise HTTPException(status_code=404, detail="Vote not found")
        elif "user ids do not match" in e.args:
            raise HTTPException(status_code=403, detail="No permission to delete")
        else:
            print(e)
            raise HTTPException(status_code=500)
