from pydantic import BaseModel


class Report(BaseModel):
    id: int
    note: str
    address: str


class ReportCreate(BaseModel):
    note: str
    address: str
