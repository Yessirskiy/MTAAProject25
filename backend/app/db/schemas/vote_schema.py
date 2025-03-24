from pydantic import BaseModel


class Vote(BaseModel):
    id: int
    user_id: int
    report_id: int
    is_helpful: bool
    

class VoteCreate(BaseModel):
    user_id: int
    report_id: int
    is_helpful: bool
