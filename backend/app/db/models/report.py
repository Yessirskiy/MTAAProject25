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
    # options were defined in the documentation (milestone 1.)
    reported = "reported"
    published = "published"
    in_progress = "in_progress"
    resolved = "resolved"
    cancelled = "cancelled"


class Report(Base):
    __tablename__ = "reports"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )  # the User account won't be deleted (will be just deactivated)
    status = Column(Enum(ReportStatus), default=ReportStatus.reported)

    report_datetime = Column(DateTime(timezone=True), server_default=func.now())
    published_datetime = Column(DateTime(timezone=True), default=None)

    note = Column(Text, nullable=False)
    admin_note = Column(Text, nullable=True)

    user = relationship("User", back_populates="reports")
    address = relationship(
        "ReportAddress", back_populates="report", uselist=False, cascade="all, delete"
    )  # One-to-one relationship requires uselist=False
    photos = relationship("ReportPhoto", back_populates="report", cascade="all, delete")
    votes = relationship("Vote", back_populates="report", cascade="all, delete")


class ReportAddress(Base):
    __tablename__ = "reportaddresses"
    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(  # unique constraint is needed to ensure one-to-one (although, not neccessary)
        Integer, ForeignKey("reports.id", ondelete="CASCADE"), unique=True
    )

    building = Column(String, nullable=True)
    street = Column(String, nullable=True)
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    postal_code = Column(String, nullable=True)
    country = Column(String, nullable=True)

    latitude = Column(Numeric(8, 6), default=None)  # precision up to 10cm
    longitude = Column(Numeric(9, 6), default=None)  # precision up to 10cm

    report = relationship("Report", back_populates="address")


class ReportPhoto(Base):
    __tablename__ = "reportphotos"
    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("reports.id", ondelete="CASCADE"))
    filename_path = Column(String, nullable=False)

    report = relationship("Report", back_populates="photos")
