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
    phone_number = Column(Text, unique=True, nullable=True)
    hashed_password = Column(String, nullable=False)
    picture_path = Column(String, nullable=True)

    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)

    created_datetime = Column(DateTime(timezone=True), server_default=func.now())
    deactivated_datetime = Column(DateTime(timezone=True), default=None)

    address = relationship("UserAddress", back_populates="user", uselist=False, cascade="all, delete")
    settings = relationship("UserSetting", back_populates="user", uselist=False, cascade="all, delete")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete")

    reports = relationship("Report", back_populates="user", cascade="all, delete")
    votes = relationship("Vote", back_populates="user", cascade="all, delete")

class UserAddress(Base):
    __tablename__ = "useraddresses"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    street = Column(String, nullable=True)
    building = Column(String, nullable=True)
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    postal_code = Column(String, nullable=True)
    country = Column(String, nullable=True)
    
    user = relationship("User", back_populates="address")
    
class UserSetting(Base):
    __tablename__ = "usersettings"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    is_name_hidden = Column(Boolean, default=False)
    is_phone_hidden = Column(Boolean, default=False)
    is_email_hidden = Column(Boolean, default=False)
    is_picture_hidden = Column(Boolean, default=False)
    is_notification_allowed = Column(Boolean, default=False)
    is_local_notification = Column(Boolean, default=False)
    is_weekly_notification = Column(Boolean, default=False)
    is_onchange_notification = Column(Boolean, default=False)
    is_onreact_notification = Column(Boolean, default=False)
    
    user = relationship("User", back_populates="settings")
    
class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    report_id = Column(Integer, ForeignKey("reports.id", ondelete="CASCADE"))
    title = Column(String)
    note = Column(String)
    sent_datetime = Column(DateTime(timezone=True), server_default=func.now())
    read_datetime = Column(DateTime(timezone=True), nullable=True, default=None)
    
    user = relationship("User", back_populates="notifications")
    report = relationship("Report", back_populates="notifications")
