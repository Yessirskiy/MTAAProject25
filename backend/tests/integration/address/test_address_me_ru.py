import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.db.models.user import User

ADDRESS_URL = "/address/me"


@pytest.mark.asyncio
async def test_get_address_me_success(client: AsyncClient, test_user: User):
    response = await client.get(ADDRESS_URL)
    assert response.status_code == 200
    data = response.json()
    assert data["street"] == "123 Test St"
    assert data["building"] == "Apt 1"
    assert data["city"] == "Testville"
    assert data["state"] == "TS"
    assert data["postal_code"] == "12345"
    assert data["country"] == "Testland"


@pytest.mark.asyncio
async def test_get_address_me_not_found(
    client: AsyncClient, db_session: AsyncSession, test_user: User
):
    # Delete address to trigger 404
    await db_session.execute(
        text("DELETE FROM useraddresses WHERE user_id = :uid"),
        {"uid": test_user.id},
    )
    await db_session.commit()

    response = await client.get(ADDRESS_URL)
    assert response.status_code == 404
    assert response.json()["detail"] == "Address not found"


@pytest.mark.asyncio
async def test_update_address_success(
    client: AsyncClient, db_session: AsyncSession, test_user: User
):
    update_data = {
        "street": "456 New St",
        "building": "Suite 100",
        "city": "Newcity",
        "state": "NC",
        "postal_code": "67890",
        "country": "Newland",
    }
    response = await client.put(ADDRESS_URL, json=update_data)
    assert response.status_code == 200
    data = response.json()
    for key, value in update_data.items():
        assert data[key] == value

    # await db_session.refresh(test_user.address)
    for key, value in update_data.items():
        assert getattr(await test_user.awaitable_attrs.address, key) == value


@pytest.mark.asyncio
async def test_update_address_not_found(
    client: AsyncClient, db_session: AsyncSession, test_user: User
):
    await db_session.execute(
        text("DELETE FROM useraddresses WHERE user_id = :uid"),
        {"uid": test_user.id},
    )
    await db_session.commit()

    update_data = {"street": "No Address St", "city": "Nowhere"}
    response = await client.put(ADDRESS_URL, json=update_data)
    assert response.status_code == 404
    assert response.json()["detail"] == "Address not found"
