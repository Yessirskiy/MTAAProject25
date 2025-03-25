from pydantic import BaseModel
from datetime import datetime
from typing import Optional

from app.db.models.report import ReportStatus


class Report(BaseModel):
    id: int
    user_id: int
    note: Optional[str]
    address: str
    created_at: datetime
    latitude: float
    longitude: float
    status: str


class ReportCreate(BaseModel):
    user_id: int
    note: Optional[str]
    address: str
    latitude: float
    longitude: float
    status: ReportStatus

    class Config:
        orm_mode = True
        use_enum_values = True
