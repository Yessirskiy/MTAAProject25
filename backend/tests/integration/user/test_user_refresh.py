import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.schemas.user_schema import UserCreate
from app.db.crud.user_crud import createUser

REFRESH_URL = "/user/refresh"


@pytest.mark.asyncio
async def test_refresh_token_success(client: AsyncClient, db_session: AsyncSession):
    user_data = UserCreate(
        email="refreshtest@example.com",
        first_name="Refresh",
        password1="password123",
        password2="password123",
    )
    await createUser(db_session, user_data, nocommit=False)

    response_login = await client.post(
        "/user/login",
        data={"username": user_data.email, "password": "password123"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    tokens = response_login.json()
    print(tokens)
    refresh_token = tokens["refresh_token"]

    response = await client.post(
        REFRESH_URL,
        params={"refresh_token": refresh_token},
    )

    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert isinstance(data["access_token"], str)


@pytest.mark.asyncio
async def test_refresh_token_invalid_token(client: AsyncClient):
    response = await client.post(
        REFRESH_URL,
        params={"refresh_token": "invalidtoken"},
    )
    assert response.status_code == 403
