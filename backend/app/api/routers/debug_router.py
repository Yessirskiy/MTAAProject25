from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError

from typing_extensions import Annotated
from functools import lru_cache

from app.core import config

from app.dependencies.common import getSettings

router = APIRouter()


@router.get("/settings", summary="Get Settings of the project")
async def getSettingsRoute():
    settings = getSettings()
    return settings.model_dump()
