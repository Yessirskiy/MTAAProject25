from pydantic import BaseModel, ConfigDict, EmailStr, model_validator, Field
import datetime
from typing import Optional, Self

from app.db.schemas.settings_schema import UserSettingsRead
from app.db.schemas.address_schema import UserAddressRead


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


class UserPrivacySettingsRead(BaseModel):
    is_name_hidden: bool
    is_email_hidden: bool


class UserRead(BaseModel):
    id: int
    first_name: str
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    created_datetime: datetime.datetime
    is_admin: bool = False

    model_config = ConfigDict(from_attributes=True)


class UserReadFeed(UserRead):
    settings: UserPrivacySettingsRead


class UserReadFull(UserRead):
    address: UserAddressRead
    settings: UserSettingsRead


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    # address: Optional[UserAddressCreate] = None
    # is_active: Optional[bool] = None


class UserChangePassword(BaseModel):
    old_password: str
    new_password1: str
    new_password2: str

    @model_validator(mode="after")
    def checkPasswordsMatch(self) -> Self:
        if self.new_password1 != self.new_password2:
            raise ValueError("Passwords do not match")
        return self


class UserPhotoUpdate(BaseModel):
    user_id: int
    picture_path: Optional[str] = None


class UserStatistics(BaseModel):
    reported_count: int
    resolved_count: int
