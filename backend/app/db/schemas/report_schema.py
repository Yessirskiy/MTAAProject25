from pydantic import BaseModel
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


class ReportPhotoRead(BaseModel):
    id: int
    report_id: int
    # filename is unneccessary


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

    class Config:
        from_attributes = True
        use_enum_values = True


class ReportReadFull(BaseModel):
    id: int
    status: ReportStatus

    report_datetime: datetime.datetime
    published_datetime: Optional[datetime.datetime] = None

    note: str

    user: UserRead
    address: ReportAddressRead
    photos: list[ReportPhotoRead]


class ReportCreate(BaseModel):
    user_id: int
    note: str
    address: ReportAddressCreate

    class Config:
        from_attributes = True
        use_enum_values = True


class ReportUpdate(BaseModel):
    note: Optional[str] = None
    address: Optional[ReportAddressUpdate] = None


class UserReports(BaseModel):
    data: list[ReportReadFull]
