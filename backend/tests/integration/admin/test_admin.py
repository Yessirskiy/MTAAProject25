import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.auth import getAdmin
from app.db.models.user import User
from app.main import app
from app.db.models.report import Report

DEACTIVATE_USER_ROUTE = "/admin/user/deactivate/{user_id}"
GET_USER_FULL_ROUTE = "/admin/user/{user_id}"
UPDATE_REPORT_ADMIN_ROUTE = "/admin/report/{report_id}"


@pytest.mark.asyncio
async def test_deactivate_user_success(
    client: AsyncClient, db_session: AsyncSession, test_user: User, admin_user: User
):
    async def override_get_admin():
        return admin_user

    app.dependency_overrides[getAdmin] = override_get_admin

    test_user.is_active = True
    db_session.add(test_user)
    await db_session.commit()
    await db_session.refresh(test_user)

    response = await client.patch(DEACTIVATE_USER_ROUTE.format(user_id=test_user.id))

    assert response.status_code == 200

    await db_session.refresh(test_user)
    assert test_user.is_active is False


@pytest.mark.asyncio
async def test_deactivate_user_not_found(client: AsyncClient, admin_user: User):
    async def override_get_admin():
        return admin_user

    app.dependency_overrides[getAdmin] = override_get_admin

    response = await client.patch(DEACTIVATE_USER_ROUTE.format(user_id=99999))

    assert response.status_code == 404
    assert response.json()["detail"] == "User not found"


@pytest.mark.asyncio
async def test_deactivate_user_already_deactivated(
    client: AsyncClient, db_session: AsyncSession, test_user: User, admin_user: User
):
    async def override_get_admin():
        return admin_user

    app.dependency_overrides[getAdmin] = override_get_admin

    test_user.is_active = False
    db_session.add(test_user)
    await db_session.commit()

    response = await client.patch(DEACTIVATE_USER_ROUTE.format(user_id=test_user.id))

    assert response.status_code == 400
    assert response.json()["detail"] == "User already deactivated"


@pytest.mark.asyncio
async def test_get_user_full_success(
    client: AsyncClient, db_session, test_user: User, admin_user: User
):
    async def override_get_admin():
        return admin_user

    app.dependency_overrides[getAdmin] = override_get_admin

    response = await client.get(GET_USER_FULL_ROUTE.format(user_id=test_user.id))

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_user.id
    assert data["email"] == test_user.email
    assert data["first_name"] == test_user.first_name


@pytest.mark.asyncio
async def test_get_user_full_not_found(client: AsyncClient, admin_user: User):
    async def override_get_admin():
        return admin_user

    app.dependency_overrides[getAdmin] = override_get_admin

    response = await client.get(GET_USER_FULL_ROUTE.format(user_id=99999))

    assert response.status_code == 404
    assert response.json()["detail"] == "User not found"


@pytest.mark.asyncio
async def test_update_report_admin_success(
    client: AsyncClient, db_session, test_report: Report, admin_user
):
    async def override_get_admin():
        return admin_user

    app.dependency_overrides[getAdmin] = override_get_admin

    payload = {
        "note": "Updated by admin",
        "admin_note": "Reviewed and verified",
        "status": "in_progress",
    }

    response = await client.put(
        UPDATE_REPORT_ADMIN_ROUTE.format(report_id=test_report.id), json=payload
    )

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_report.id
    assert data["note"] == "Updated by admin"
    assert data["admin_note"] == "Reviewed and verified"
    assert data["status"] == "in_progress"


@pytest.mark.asyncio
async def test_update_report_admin_not_found(client: AsyncClient, admin_user):
    async def override_get_admin():
        return admin_user

    app.dependency_overrides[getAdmin] = override_get_admin

    payload = {"note": "Does not exist", "admin_note": "Invalid", "status": "cancelled"}

    response = await client.put(
        UPDATE_REPORT_ADMIN_ROUTE.format(report_id=99999), json=payload
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Report not found"
