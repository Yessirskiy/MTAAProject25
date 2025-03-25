from app.db.base import Base
from sqlalchemy import (
    Column,
    Integer,
    Numeric,
    String,
    Boolean,
    Enum,
    ForeignKey,
    Text,
    DateTime,
    func,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
import enum

# from sqlalchemy.orm import relationship
from app.db.base import Base


class ReportStatus(enum.Enum):
    # Enum options are usually in uppercase
    # options were defined in the documentation (milestone 1.)
    REPORTED = "reported"
    PUBLISHED = "published"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CANCELLED = "cancelled"


class Report(Base):
    __tablename__ = "reports"
    id = Column(
        Integer, primary_key=True, index=True
    )  # primary keys are not nullable by definition
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE")
    )  # the User account won't be deleted (will be just deactivated)
    note = Column(Text, nullable=True)
    address = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    latitude = Column(Numeric(8, 6), default=None)  # precision up to 10cm
    longitude = Column(Numeric(9, 6), default=None)  # precisin up to 10 cm
    status = Column(Enum(ReportStatus), default=ReportStatus.REPORTED)

    user = relationship("User", back_populates="reports")
    votes = relationship("Vote", back_populates="report", cascade="all, delete")
