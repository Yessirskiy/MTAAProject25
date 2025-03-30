from app.db.base import Base
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    ForeignKey,
    Float,
    Enum,
    DateTime,
    Boolean,
    Enum,
    func,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from app.db.base import Base


class Vote(Base):
    __tablename__ = "votes"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    report_id = Column(Integer, ForeignKey("reports.id", ondelete="CASCADE"))
    is_positive = Column(Boolean, nullable=False)
    created_datetime = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="votes")
    report = relationship("Report", back_populates="votes")

    __table_args__ = (
        UniqueConstraint("user_id", "report_id", name="unique_user_vote"),
    )  # only one vote per user per report
