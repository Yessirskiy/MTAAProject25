from pydantic import BaseModel, EmailStr, model_validator
import datetime
from typing import Optional, Self


class User(BaseModel):
    id: int
    first_name: str
    last_name: Optional[str] = None
    email: str

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
    created_datetime: datetime.datetime


class UserReadFull(UserRead): ...
