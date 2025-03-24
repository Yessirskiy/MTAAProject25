from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError

from app.db.base import getSession
from app.db.models.vote import Vote
from app.db.schemas.vote_schema import *
from app.db.crud.vote_crud import create_vote

router = APIRouter()


@router.post("/create", response_model=Vote, summary="Create Vote")
async def createVoteRoute(
    votecreate: VoteCreate,
    db: AsyncSession = Depends(getSession),
) -> Vote:
    created_vote = await create_vote(db, votecreate)
    return created_vote
