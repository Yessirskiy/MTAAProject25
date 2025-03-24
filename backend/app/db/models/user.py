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
)
from sqlalchemy.orm import relationship

# from sqlalchemy.orm import relationship
from app.db.base import Base


# class User(Base):
#     __tablename__ = "users"
#     id = Column(Integer, primary_key=True, index=True)
#     first_name = Column(String)
#     last_name = Column(String, nullable=True)
#     email = Column(String, unique=True, index=True)


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(Text, unique=True, nullable=False)
    email = Column(Text, unique=True, nullable=False)
    password = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # reports = relationship("Report", back_populates="user", cascade="all, delete")
    # votes = relationship()
