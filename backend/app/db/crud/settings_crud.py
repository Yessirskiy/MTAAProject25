from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.models.user import UserSetting
from app.db.schemas.settings_schema import (
    UserSettingsCreate,
    UserSettingsUpdate,
)
from typing import Optional


async def getSettings(db: AsyncSession, user_id: int) -> Optional[UserSetting]:
    stmt = select(UserSetting).where(UserSetting.user_id == user_id)
    return (await db.scalars(stmt)).one_or_none()


async def createSettings(
    db: AsyncSession, user_id: int, nocommit: bool = True
) -> UserSetting:
    user_settings_create = UserSettingsCreate(user_id=user_id)
    data = user_settings_create.model_dump()
    new_settings = UserSetting(**data)
    db.add(new_settings)
    if not nocommit:
        await db.commit()
        await db.refresh(new_settings)
        return new_settings
    await db.flush()
    return new_settings


async def updateSettings(
    db: AsyncSession,
    user_id: int,
    user_settings: UserSettingsUpdate,
) -> Optional[UserSetting]:
    settings = await getSettings(db, user_id)
    assert settings is not None, "Settings not found"
    new_data = user_settings.model_dump(exclude_none=True)
    for key, value in new_data.items():
        setattr(settings, key, value)
    await db.commit()
    await db.refresh(settings)
    return settings
