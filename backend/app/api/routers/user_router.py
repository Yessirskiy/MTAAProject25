from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError

from app.db.base import getSession
from app.db.models.user import User
from app.db.schemas.user_schema import *
from app.db.crud.user_crud import create_user

router = APIRouter()


@router.post("/create", response_model=User, summary="Create User")
async def createUserRoute(
    usercreate: UserCreate,
    db: AsyncSession = Depends(getSession),
) -> User:
    created_user = await create_user(db, usercreate)
    return created_user
