from pydantic import BaseModel
import datetime
from typing import Optional


class Notification(BaseModel):
    id: int
    user_id: int
    report_id: int
    title: str
    note: str
    sent_datetime: datetime.datetime
    read_datetime: Optional[datetime.datetime] = None


class NotificationCreate(BaseModel):
    user_id: int
    report_id: int
    title: str
    note: str


class NotificationUpdate(BaseModel):
    user_id: int
    report_id: int
    title: Optional[str] = None
    note: Optional[str] = None
    read_datetime: Optional[datetime.datetime] = None


class UserNotifications(BaseModel):
    data: list[Notification]
