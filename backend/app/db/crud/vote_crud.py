from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, select
from sqlalchemy.orm import joinedload
from app.db.models.vote import Vote
from app.db.schemas.vote_schema import VoteCreate, VoteUpdate
import datetime
from typing import Optional


async def getVote(db: AsyncSession, user_id: int, report_id: int) -> Optional[Vote]:
    result = await db.execute(
        select(Vote).where(
            Vote.report_id == report_id,
            Vote.user_id == user_id,
        )
    )
    vote = result.scalar_one_or_none()
    return vote


async def createVote(db: AsyncSession, vote_create: VoteCreate) -> Vote:
    data = vote_create.model_dump(exclude_none=True)
    new_vote = Vote(**data)
    db.add(new_vote)
    await db.commit()
    await db.refresh(new_vote)
    return new_vote


async def updateVote(db: AsyncSession, vote_update: VoteUpdate) -> Vote:
    result = await db.execute(
        select(Vote).where(
            Vote.report_id == vote_update.report_id,
            Vote.user_id == vote_update.user_id,
        )
    )
    vote = result.scalar_one_or_none()
    assert vote is not None, "Vote not found"

    new_data = vote_update.model_dump(exclude=["report_id"], exclude_none=True)
    for key, value in new_data.items():
        setattr(vote, key, value)
    await db.commit()
    await db.refresh(vote)
    return vote


async def deleteVote(db: AsyncSession, user_id: int, report_id: int) -> None:
    result = await db.execute(
        select(Vote).where(
            Vote.report_id == report_id,
            Vote.user_id == user_id,
        )
    )
    vote = result.scalar_one_or_none()
    assert vote is not None, "Vote not found"

    await db.delete(vote)
    await db.commit()
