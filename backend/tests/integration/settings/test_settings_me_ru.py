import pytest
from sqlalchemy import text
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.main import app
from app.dependencies.auth import getUser
from app.db.models.user import User

GET_SETTINGS_URL = "/settings/me"


@pytest.mark.asyncio
async def test_get_settings_success(client: AsyncClient, test_user: User):
    response = await client.get(GET_SETTINGS_URL)
    assert response.status_code == 200
    data = response.json()
    assert "is_notification_allowed" in data


@pytest.mark.asyncio
async def test_get_settings_not_found(
    client: AsyncClient, db_session: AsyncSession, test_user: User
):
    await db_session.execute(
        text("DELETE FROM usersettings WHERE user_id = :uid"),
        {"uid": test_user.id},
    )
    await db_session.commit()

    response = await client.get(GET_SETTINGS_URL)
    assert response.status_code == 404
    assert response.json()["detail"] == "Settings not found"
