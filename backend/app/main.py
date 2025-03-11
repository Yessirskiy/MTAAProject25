from fastapi import Depends, FastAPI
from app.api.routers.report_router import router as report_router
import asyncio
from app.db.base import init_models

app = FastAPI()

app.include_router(report_router, prefix="/report", tags=["Report"])


@app.on_event("startup")
async def startup_event():
    await init_models()
