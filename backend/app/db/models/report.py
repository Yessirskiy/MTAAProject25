from app.db.base import Base
from sqlalchemy import (
    Column,
    Integer,
    Float,
    String,
    Boolean,
    Enum,
    ForeignKey,
    Text,
    DateTime,
    func,
)
from sqlalchemy.orm import relationship
import enum

# from sqlalchemy.orm import relationship
from app.db.base import Base


class ReportStatus(enum.Enum):
    pending = "pending"
    in_progress = "in_progress"
    fixed = "fixed"


# class User(Base):
#     __tablename__ = "users"
#     id = Column(Integer, primary_key=True, index=True)
#     first_name = Column(String)
#     last_name = Column(String, nullable=True)
#     email = Column(String, unique=True, index=True)


class Report(Base):
    __tablename__ = "reports"
    id = Column(Integer, primary_key=True, index=True, nullable=False)
    # user_id = Column(Integer, ForeignKey('user.id', ondelete="CASCADE")) #maybe can be nullable if a user deletes their account but we keep their reports?
    note = Column(Text, nullable=True)
    address = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    latitude = Column(Float)
    longitude = Column(Float)
    status = Column(Enum(ReportStatus), default=ReportStatus.pending)

    # user = relationship("User", back_populates="reports")
    # images = relationship()
    # votes = relationship()
