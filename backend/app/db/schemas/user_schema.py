from pydantic import BaseModel, EmailStr, model_validator
import datetime
from typing import Optional, Self


class User(BaseModel):
    id: int
    first_name: str
    last_name: Optional[str] = None
    email: str
    phone_number: Optional[str] = None
    is_active: bool
    is_admin: bool

    created_datetime: datetime.datetime
    deactivated_datetime: Optional[datetime.datetime] = None


class UserCreate(BaseModel):
    first_name: str
    email: EmailStr
    password1: str
    password2: str

    @model_validator(mode="after")
    def checkPasswordsMatch(self) -> Self:
        if self.password1 != self.password2:
            raise ValueError("Passwords do not match")
        return self


class UserRead(BaseModel):
    id: int
    first_name: str
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    created_datetime: datetime.datetime


class UserReadFull(UserRead): ...

class UserAddress(BaseModel):
    id: int
    user_id: int

    building: Optional[str] = None
    street: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    
class UserAddressCreate(BaseModel):
    building: Optional[str] = None
    street: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None

class UserAddressRead(UserAddress): ...

class UserAddressUpdate(UserAddressCreate): ...

class UserSettings(BaseModel):
    id: int
    user_id: int
    
    is_name_hidden: bool
    is_phone_hidden: bool
    is_email_hidden: bool
    is_picture_hidden: bool
    is_notification_allowed: bool
    is_local_notification: bool
    is_weekly_notification: bool
    is_onchange_notification: bool
    is_onreact_notification: bool

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[UserAddressCreate] = None

class UserSettingsSet(BaseModel):
    is_name_hidden: bool = False
    is_phone_hidden: bool = False
    is_email_hidden: bool = False
    is_picture_hidden: bool = False
    is_notification_allowed: bool = False
    is_local_notification: bool = False
    is_weekly_notification: bool = False
    is_onchange_notification: bool = False
    is_onreact_notification: bool = False
    
    @model_validator(mode="after")
    def validate_notifications(self) -> Self:
        if not self.is_notification_allowed:
            self.is_local_notification = False
            self.is_weekly_notification = False
            self.is_onchange_notification = False
            self.is_onreact_notification = False
        return self

class UserSettingsRead(UserSettings): ...

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