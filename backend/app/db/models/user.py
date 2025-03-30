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

# from sqlalchemy.orm import relationship
from app.db.base import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String)
    email = Column(Text, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    picture_path = Column(String, nullable=True)

    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)

    created_datetime = Column(DateTime(timezone=True), server_default=func.now())
    deactivated_datetime = Column(DateTime(timezone=True), default=None)

    reports = relationship("Report", back_populates="user", cascade="all, delete")
    votes = relationship("Vote", back_populates="user", cascade="all, delete")
