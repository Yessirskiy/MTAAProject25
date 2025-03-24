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


# class User(Base):
#     __tablename__ = "users"
#     id = Column(Integer, primary_key=True, index=True)
#     first_name = Column(String)
#     last_name = Column(String, nullable=True)
#     email = Column(String, unique=True, index=True)


class Vote(Base):
    __tablename__ = "votes"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete="CASCADE"))
    report_id = Column(Integer, ForeignKey('reports.id', ondelete="CASCADE"))
    is_helpful = Column(Boolean, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="vote")
    report = relationship("Report", back_populates="vote")
    
    __table_args__ = (
        UniqueConstraint('user_id', 'report_id', name='unique_user_vote'),
    )
