from pydantic import BaseModel, EmailStr


class User(BaseModel):
    id: int
    username: str
    email: EmailStr
    password: str
    is_admin: bool


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
