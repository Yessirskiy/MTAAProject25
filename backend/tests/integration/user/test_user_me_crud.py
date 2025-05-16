import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.user import User
from pathlib import Path
from app.dependencies.common import getSettings
from app.utils.passwords import verifyPassword

ME_URL = "/user/me"


@pytest.mark.asyncio
async def test_get_me(client: AsyncClient):
    response = await client.get(ME_URL)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "testuser@example.com"


@pytest.mark.asyncio
async def test_update_me_success(client: AsyncClient):
    update_data = {"email": "updateuser@example.com", "first_name": "Updated"}
    response = await client.put(ME_URL, json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["first_name"] == "Updated"
    assert data["email"] == "updateuser@example.com"


@pytest.mark.asyncio
async def test_update_me_not_found(
    client: AsyncClient, db_session: AsyncSession, test_user: User
):
    await db_session.delete(test_user)
    await db_session.commit()
    update_data = {"email": "updateuser@example.com", "first_name": "Still Updated"}
    response = await client.put(ME_URL, json=update_data)
    assert response.status_code == 404
    assert response.json()["detail"] == "User not found"


@pytest.mark.asyncio
async def test_delete_me_success(
    client: AsyncClient, db_session: AsyncSession, test_user: User
):
    response = await client.delete(ME_URL)
    await db_session.refresh(test_user)
    assert response.status_code == 200
    assert test_user.is_active is False


@pytest.mark.asyncio
async def test_get_me_photo_success(
    client: AsyncClient, test_user: User, override_user_photos
):
    response = await client.get(ME_URL + "/photo")
    assert response.status_code == 200
    assert b"fake image content" in response.content


@pytest.mark.asyncio
async def test_get_me_photo_no_picture(
    client: AsyncClient, db_session: AsyncSession, test_user: User
):
    test_user.picture_path = None
    db_session.add(test_user)
    await db_session.commit()
    response = await client.get(ME_URL + "/photo")
    assert response.status_code == 204


@pytest.mark.asyncio
async def test_get_me_photo_file_missing(
    client: AsyncClient, db_session: AsyncSession, test_user: User
):
    test_user.picture_path = "nonexistent.jpg"
    db_session.add(test_user)
    await db_session.commit()
    response = await client.get(ME_URL + "/photo")
    assert response.status_code == 500


@pytest.mark.asyncio
async def test_put_me_photo_success(client: AsyncClient, override_user_photos):
    file_content = b"fake image"
    files = {"photo": ("test.jpg", file_content, "image/jpeg")}
    response = await client.put(ME_URL + "/photo", files=files)
    assert response.status_code == 200
    uploaded_file = list(getSettings().USER_PHOTOS.iterdir())[0]
    assert uploaded_file.read_bytes() == file_content


@pytest.mark.asyncio
async def test_put_me_photo_invalid_extension_not_checked(
    client: AsyncClient, override_user_photos
):
    file_content = b"not an image"
    files = {"photo": ("test.txt", file_content, "text/plain")}
    response = await client.put(ME_URL + "/photo", files=files)
    assert response.status_code == 200
    uploaded_file = list(getSettings().USER_PHOTOS.iterdir())[0]
    assert uploaded_file.suffix == ".txt"


@pytest.mark.asyncio
async def test_delete_me_photo_success(
    client: AsyncClient, db_session: AsyncSession, test_user: User
):
    assert test_user.picture_path is not None
    response = await client.delete(ME_URL + "/photo")
    await db_session.refresh(test_user)
    assert response.status_code == 200
    assert test_user.picture_path is None


@pytest.mark.asyncio
async def test_delete_me_photo_none(
    client: AsyncClient, db_session: AsyncSession, test_user: User
):
    test_user.picture_path = None
    db_session.add(test_user)
    await db_session.commit()
    response = await client.delete(ME_URL + "/photo")
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_change_password_success(
    client: AsyncClient, db_session: AsyncSession, test_user: User
):
    payload = {
        "old_password": "password1234",
        "new_password1": "newsecure123",
        "new_password2": "newsecure123",
    }
    response = await client.put("/user/change-password", json=payload)
    await db_session.refresh(test_user)
    assert response.status_code == 200
    assert verifyPassword("newsecure123", test_user.hashed_password)


@pytest.mark.asyncio
async def test_change_password_wrong_old(
    client: AsyncClient, db_session: AsyncSession, test_user: User
):
    payload = {
        "old_password": "wrong",
        "new_password1": "newsecure123",
        "new_password2": "newsecure123",
    }
    response = await client.put("/user/change-password", json=payload)
    await db_session.refresh(test_user)
    assert response.status_code == 400
    assert verifyPassword("password1234", test_user.hashed_password)
