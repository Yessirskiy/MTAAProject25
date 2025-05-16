from pydantic import BaseModel, ConfigDict
import datetime
import decimal
from typing import Optional

from app.db.models.report import ReportStatus
from app.db.schemas.user_schema import UserRead


class ReportPhoto(BaseModel):
    id: int
    report_id: int
    filename_path: str


class ReportPhotoCreate(BaseModel):
    report_id: int
    filename_path: str
    ai_score: Optional[int] = None
    ai_labels: Optional[list[str]] = None


class ReportPhotoRead(BaseModel):
    id: int
    report_id: int
    # filename is unneccessary

    model_config = ConfigDict(from_attributes=True)

    # class Config:
    #     from_attributes = True


class ReportAddress(BaseModel):
    id: int
    report_id: int

    building: Optional[str] = None
    street: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None

    latitude: decimal.Decimal
    longitude: decimal.Decimal

    model_config = ConfigDict(from_attributes=True)
    # class Config:
    #     from_attributes = True


class ReportAddressCreate(BaseModel):
    building: Optional[str] = None
    street: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None

    latitude: decimal.Decimal
    longitude: decimal.Decimal


class ReportAddressRead(ReportAddress): ...


class ReportAddressUpdate(ReportAddressCreate): ...


class Report(BaseModel):
    id: int
    user_id: int
    status: ReportStatus

    report_datetime: datetime.datetime
    published_datetime: Optional[datetime.datetime] = None

    note: str
    admin_note: Optional[str] = None

    votes_pos: int
    votes_neg: int

    model_config = ConfigDict(from_attributes=True, use_enum_values=True)
    # class Config:
    #     from_attributes = True
    #     use_enum_values = True


class ReportReadFull(BaseModel):
    id: int
    status: ReportStatus

    report_datetime: datetime.datetime
    published_datetime: Optional[datetime.datetime] = None

    note: str
    admin_note: Optional[str] = None

    votes_pos: int
    votes_neg: int

    user: UserRead
    address: ReportAddressRead
    photos: list[ReportPhotoRead]

    model_config = ConfigDict(from_attributes=True, use_enum_values=True)
    # class Config:
    #     from_attributes = True
    #     use_enum_values = True


class ReportCreate(BaseModel):
    user_id: int
    note: str
    address: ReportAddressCreate

    model_config = ConfigDict(from_attributes=True, use_enum_values=True)
    # class Config:
    #     from_attributes = True
    #     use_enum_values = True


class ReportUpdate(BaseModel):
    note: Optional[str] = None
    address: Optional[ReportAddressUpdate] = None


class ReportUpdateAdmin(ReportUpdate):
    status: Optional[ReportStatus] = None

    report_datetime: Optional[datetime.datetime] = None
    published_datetime: Optional[datetime.datetime] = None

    # note: Optional[str] = None
    admin_note: Optional[str] = None
    votes_pos: Optional[int] = None
    votes_neg: Optional[int] = None

    # address: Optional[ReportAddressRead] = None


class UserReports(BaseModel):
    data: list[ReportReadFull]


class FeedReports(BaseModel):
    data: list[ReportReadFull]
