from app.db.base import Base
from sqlalchemy import Column, Integer, String, Boolean, Enum

# from sqlalchemy.orm import relationship
from app.db.base import Base


# class User(Base):
#     __tablename__ = "users"
#     id = Column(Integer, primary_key=True, index=True)
#     first_name = Column(String)
#     last_name = Column(String, nullable=True)
#     email = Column(String, unique=True, index=True)


class Report(Base):
    __tablename__ = "reports"
    id = Column(Integer, primary_key=True, index=True)
    note = Column(String, nullable=True)
    address = Column(String, nullable=False)
