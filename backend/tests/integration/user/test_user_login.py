import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.schemas.user_schema import UserCreate
from app.db.crud.user_crud import createUser


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient, db_session: AsyncSession):
    user_data = UserCreate(
        email="loginuser@example.com",
        first_name="Test",
        password1="strongpass123",
        password2="strongpass123",
    )
    await createUser(db_session, user_data, nocommit=False)

    response = await client.post(
        "/user/login",
        data={
            "username": "loginuser@example.com",
            "password": "strongpass123",
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )

    assert response.status_code == 200
    tokens = response.json()
    assert "access_token" in tokens
    assert "refresh_token" in tokens


@pytest.mark.asyncio
async def test_login_invalid_email(client: AsyncClient):
    response = await client.post(
        "/user/login",
        data={
            "username": "nonexistent@example.com",
            "password": "whatever",
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password"


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient, db_session: AsyncSession):
    user_data = UserCreate(
        email="wrongpass@example.com",
        first_name="Test",
        password1="rightpass",
        password2="rightpass",
    )
    await createUser(db_session, user_data, nocommit=False)

    response = await client.post(
        "/user/login",
        data={
            "username": "wrongpass@example.com",
            "password": "wrongpass",
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"
