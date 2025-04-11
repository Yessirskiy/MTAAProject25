from pydantic import BaseModel


class VoteRead(BaseModel):
    id: int
    user_id: int
    report_id: int
    is_positive: bool


class VoteCreate(BaseModel):
    user_id: int
    report_id: int
    is_positive: bool


class VoteUpdate(BaseModel):
    user_id: int
    report_id: int
    is_positive: bool
