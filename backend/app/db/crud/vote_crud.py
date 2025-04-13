from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import select
from app.db.models.vote import Vote
from app.db.schemas.vote_schema import VoteCreate, VoteUpdate
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
    await db.flush()
    report = await new_vote.awaitable_attrs.report
    if vote_create.is_positive:
        report.votes_pos += 1
    else:
        report.votes_neg += 1
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
        if key == "is_positive" and value and not vote.is_positive:
            report = await vote.awaitable_attrs.report
            report.votes_pos += 1
            report.votes_neg -= 1
        elif key == "is_positive" and not value and vote.is_positive:
            report = await vote.awaitable_attrs.report
            report.votes_pos -= 1
            report.votes_neg += 1
        setattr(vote, key, value)
    await db.commit()
    await db.refresh(vote)
    return vote


async def deleteVote(db: AsyncSession, user_id: int, report_id: int) -> None:
    vote = await getVote(db, user_id, report_id)
    assert vote is not None, "Vote not found"
    report = await vote.awaitable_attrs.report
    if vote.is_positive:
        report.votes_pos -= 1
    else:
        report.votes_neg += 1

    await db.delete(vote)
    await db.commit()
