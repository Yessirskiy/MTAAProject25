from pydantic import BaseModel, EmailStr, model_validator
import datetime
from typing import Optional, Self

from app.db.schemas.settings_schema import UserSettingsRead


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


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[UserAddressCreate] = None


class UserReadFull(UserRead):
    address: UserAddressRead
    settings: UserSettingsRead
