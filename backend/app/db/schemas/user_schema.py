from pydantic import BaseModel


class User(BaseModel):
    id: int
    username: str
    email: str
    password: str
    #created_at
    
class UserCreate(BaseModel):
    username: str
    email: str
    password: str

