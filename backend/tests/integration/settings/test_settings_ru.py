import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.db.models.user import User, UserAddress, UserSetting
from app.main import app
from app.dependencies.auth import getUser

GET_SETTINGS_URL = "/settings/{user_id}"


@pytest.mark.asyncio
async def test_get_user_own(client: AsyncClient, test_user: User):
    url = GET_SETTINGS_URL.format(user_id=test_user.id)
    response = await client.get(url)
    assert response.status_code == 200
    data = response.json()
    assert "is_notification_allowed" in data


@pytest.mark.asyncio
async def test_get_user_forbidden(
    client: AsyncClient, test_user: User, db_session: AsyncSession
):
    other_user = User(
        email="other@example.com",
        first_name="Other",
        hashed_password="hashedpassword",
        is_admin=False,
    )
    db_session.add(other_user)
    await db_session.commit()
    await db_session.refresh(other_user)

    settings = UserSetting(user_id=other_user.id)
    db_session.add(settings)
    await db_session.commit()

    url = GET_SETTINGS_URL.format(user_id=other_user.id)
    response = await client.get(url)
    assert response.status_code == 403
    assert response.json()["detail"] == "Permission denied"


@pytest.mark.asyncio
async def test_admin_can_get_any_settings(
    client: AsyncClient,
    admin_user: User,
    db_session: AsyncSession,
):
    async def override_get_user():
        return admin_user

    app.dependency_overrides[getUser] = override_get_user

    other_user = User(
        email="other@example.com",
        first_name="Other",
        hashed_password="hashedpassword",
        is_admin=False,
    )
    db_session.add(other_user)
    await db_session.commit()
    await db_session.refresh(other_user)

    settings = UserSetting(user_id=other_user.id)
    db_session.add(settings)
    await db_session.commit()
    await db_session.refresh(other_user)

    url = GET_SETTINGS_URL.format(user_id=other_user.id)
    response = await client.get(url)
    assert response.status_code == 200
    data = response.json()
    assert "is_notification_allowed" in data

    app.dependency_overrides.pop(getUser, None)


@pytest.mark.asyncio
async def test_get_settings_not_found(
    client: AsyncClient, test_user, db_session: AsyncSession
):
    await db_session.execute(
        text("DELETE FROM usersettings WHERE user_id = :uid"),
        {"uid": test_user.id},
    )
    await db_session.commit()

    url = GET_SETTINGS_URL.format(user_id=test_user.id)
    response = await client.get(url)
    assert response.status_code == 404
    assert response.json()["detail"] == "Settings not found"
