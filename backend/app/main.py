from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from contextlib import asynccontextmanager
from app.dependencies.common import getSettings

from app.api.routers.report_router import router as report_router
from app.api.routers.user_router import router as user_router
from app.api.routers.debug_router import router as debug_router
from app.api.routers.vote_router import router as vote_router
from app.api.routers.notification_router import router as notification_router
from app.api.routers.admin_router import router as admin_router
from app.api.routers.settings_router import router as settings_router
from app.api.routers.address_router import router as address_router


def setupDirs():  # Creating dirs (to store photos)
    settings = getSettings()
    if not settings.REPORT_PHOTOS.exists():
        settings.REPORT_PHOTOS.mkdir(parents=True, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    setupDirs()
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware, allow_origins=["http://127.0.0.1:8000", "http://localhost:8000"]
)


app.include_router(user_router, prefix="/user", tags=["User"])
app.include_router(settings_router, prefix="/settings", tags=["Settings"])
app.include_router(address_router, prefix="/address", tags=["Address"])

app.include_router(report_router, prefix="/report", tags=["Report"])
app.include_router(vote_router, prefix="/vote", tags=["Vote"])

app.include_router(notification_router, prefix="/notification", tags=["Notification"])
app.include_router(admin_router, prefix="/admin", tags=["Admin"])

app.include_router(debug_router, prefix="/debug", tags=["Debug"])
