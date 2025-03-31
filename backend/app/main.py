from fastapi import FastAPI
import os
from contextlib import asynccontextmanager
from app.dependencies.common import getSettings

from app.api.routers.report_router import router as report_router
from app.api.routers.user_router import router as user_router
from app.api.routers.debug_router import router as debug_router
from app.api.routers.vote_router import router as vote_router


def setupDirs():  # Creating dirs (to store photos)
    settings = getSettings()
    if not settings.REPORT_PHOTOS.exists():
        settings.REPORT_PHOTOS.mkdir(parents=True, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    setupDirs()
    yield


app = FastAPI(lifespan=lifespan)


app.include_router(report_router, prefix="/report", tags=["Report"])
app.include_router(user_router, prefix="/user", tags=["User"])
app.include_router(vote_router, prefix="/vote", tags=["Vote"])
app.include_router(debug_router, prefix="/debug", tags=["Debug"])
