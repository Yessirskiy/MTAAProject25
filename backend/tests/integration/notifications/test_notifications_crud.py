from httpx import AsyncClient
import pytest

from app.db.models.user import User
from app.db.models.report import Report
from app.db.models.user import Notification
from app.db.crud.notifications_crud import createNotification
from app.db.schemas.notification_schema import NotificationCreate

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.dependencies.auth import getAdmin, getUser
from app.main import app


NOTIFICATION_CREATE_ROUTE = "/notification/create"
NOTIFICATION_ROUTE = "/notification/{notification_id}"


@pytest.mark.asyncio
async def test_create_notification_success(
    client: AsyncClient,
    db_session: AsyncSession,
    test_report: Report,
    admin_user: User,
):
    async def override_get_admin():
        return admin_user

    app.dependency_overrides[getAdmin] = override_get_admin

    other_user = User(
        email="other@example.com",
        first_name="Other",
        hashed_password="hashedpassword",
        is_admin=False,
    )
    db_session.add(other_user)
    await db_session.commit()
    await db_session.refresh(other_user)

    payload = {
        "user_id": other_user.id,
        "report_id": test_report.id,
        "title": "New Notification",
        "note": "This is a test notification.",
    }

    response = await client.post(NOTIFICATION_CREATE_ROUTE, params=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == other_user.id
    assert data["report_id"] == test_report.id
    assert data["title"] == payload["title"]
    assert data["note"] == payload["note"]
    assert data["read_datetime"] is None


@pytest.mark.asyncio
async def test_get_notification_success(
    client: AsyncClient,
    db_session: AsyncSession,
    test_report,
    test_user: User,
):
    async def override_get_user():
        return test_user

    app.dependency_overrides[getUser] = override_get_user

    notification = Notification(
        user_id=test_user.id,
        report_id=test_report.id,
        title="Reminder",
        note="Your report is under review.",
    )
    db_session.add(notification)
    await db_session.commit()
    await db_session.refresh(notification)

    response = await client.get(
        NOTIFICATION_ROUTE.format(notification_id=notification.id)
    )

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == notification.id
    assert data["user_id"] == test_user.id
    assert data["report_id"] == test_report.id
    assert data["title"] == "Reminder"
    assert data["note"] == "Your report is under review."


@pytest.mark.asyncio
async def test_get_notification_not_found(
    client: AsyncClient,
    test_user: User,
):
    async def override_get_user():
        return test_user

    app.dependency_overrides[getUser] = override_get_user

    response = await client.get(NOTIFICATION_ROUTE.format(notification_id=99999))

    assert response.status_code == 404
    assert response.json()["detail"] == "Notification not found"


@pytest.mark.asyncio
async def test_mark_notification_as_read_success(
    client: AsyncClient,
    db_session,
    test_user,
    test_report,
):
    async def override_get_user():
        return test_user

    app.dependency_overrides[getUser] = override_get_user

    notification = Notification(
        user_id=test_user.id,
        report_id=test_report.id,
        title="Reminder",
        note="Please review your report",
    )
    db_session.add(notification)
    await db_session.commit()
    await db_session.refresh(notification)

    patch_url = NOTIFICATION_ROUTE.format(notification_id=notification.id)
    response = await client.patch(patch_url)

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == notification.id
    assert data["read_datetime"] is not None


@pytest.mark.asyncio
async def test_mark_notification_as_read_not_found(client: AsyncClient, test_user):
    async def override_get_user():
        return test_user

    app.dependency_overrides[getUser] = override_get_user

    response = await client.patch(NOTIFICATION_ROUTE.format(notification_id=99999))

    assert response.status_code == 404
    assert response.json()["detail"] == "Notification not found"


@pytest.mark.asyncio
async def test_delete_notification_success(
    client: AsyncClient,
    db_session,
    test_user,
    test_report,
):
    async def override_get_user():
        return test_user

    app.dependency_overrides[getUser] = override_get_user

    notification = Notification(
        user_id=test_user.id,
        report_id=test_report.id,
        title="To Delete",
        note="This notification will be deleted.",
    )
    db_session.add(notification)
    await db_session.commit()
    await db_session.refresh(notification)

    delete_url = NOTIFICATION_ROUTE.format(notification_id=notification.id)
    response = await client.delete(delete_url)

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == notification.id
    assert data["title"] == "To Delete"
    assert data["note"] == "This notification will be deleted."


@pytest.mark.asyncio
async def test_delete_notification_not_found(client: AsyncClient, test_user):
    async def override_get_user():
        return test_user

    app.dependency_overrides[getUser] = override_get_user

    response = await client.delete(NOTIFICATION_ROUTE.format(notification_id=99999))

    assert response.status_code == 404
    assert response.json()["detail"] == "Notification not found"
