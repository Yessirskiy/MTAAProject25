import pytest
from app.db.schemas.user_schema import UserCreate
from sqlalchemy.ext.asyncio import AsyncSession
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_signup_user_success(client: AsyncClient):
    user_data = {
        "email": "newuser@example.com",
        "first_name": "Marek",
        "password1": "securepassword123",
        "password2": "securepassword123",
    }

    response = await client.post("/user/signup", json=user_data)
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_signup_user_duplicate_email(
    client: AsyncClient, db_session: AsyncSession
):

    from app.db.crud.user_crud import createUser

    usercreate = UserCreate(
        email="existing@example.com",
        first_name="Marek",
        password1="pass123",
        password2="pass123",
    )
    await createUser(db_session, usercreate, nocommit=False)

    user_data = {
        "email": "existing@example.com",
        "first_name": "Marek",
        "password1": "newpass123",
        "password2": "newpass123",
    }
    response = await client.post("/user/signup", json=user_data)

    assert response.status_code == 400
    assert response.json()["detail"] == "Email is already in use"
