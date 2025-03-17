from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update
from sqlalchemy.orm import joinedload
from app.db.models.user import User
from app.db.schemas.user_schema import User
import datetime
from typing import Optional


async def create_user(db:AsyncSession, username, email, password) -> User:
    new_user = User(username=username, email=email, password=password)
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user
    
    

