from fastapi import Depends, FastAPI
from app.api.routers.report_router import router as report_router
from app.api.routers.user_router import router as user_router
from app.api.routers.debug_router import router as debug_router
import asyncio
from app.db.base import init_models

app = FastAPI()

app.include_router(report_router, prefix="/report", tags=["Report"])
app.include_router(user_router, prefix="/user", tags=["User"])
app.include_router(debug_router, prefix="/debug", tags=["Debug"])


@app.on_event("startup")
async def startup_event():
    await init_models()
