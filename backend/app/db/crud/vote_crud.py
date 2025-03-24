from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, select, and_
from sqlalchemy.orm import joinedload
from app.db.models.vote import Vote
from app.db.schemas.vote_schema import VoteCreate
import datetime
from typing import Optional


async def create_vote(db: AsyncSession, vote_create: VoteCreate) -> Vote:
    data = vote_create.model_dump(exclude_none=True)
    new_vote = Vote(**data)
    db.add(new_vote)
    await db.commit()
    await db.refresh(new_vote)
    return new_vote

async def update_vote(db: AsyncSession, user_id: int, report_id: int, is_helpful: bool) -> Optional[Vote]:
    result = await db.execute(select(Vote).where(and_(Vote.user_id == user_id, Vote.report_id == report_id)))
    vote = result.scalar_one_or_none()
    if vote:
        vote.is_helpful = is_helpful
        await db.commit()
        await db.refresh(vote)
    return vote

async def delete_vote(db: AsyncSession, user_id: int, report_id: int) -> None:
    result = await db.execute(select(Vote).where(and_(Vote.user_id == user_id, Vote.report_id == report_id)))
    vote = result.scalar_one_or_none()
    if vote:
        await db.delete(vote)
        await db.commit()
