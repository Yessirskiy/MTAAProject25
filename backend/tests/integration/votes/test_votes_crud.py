import pytest
from httpx import AsyncClient
from sqlalchemy.exc import IntegrityError
import asyncpg
from app.db.models.vote import Vote
from app.db.schemas.vote_schema import VoteCreate, VoteRead
from app.db.models.user import User

VOTE_CREATE_ROUTE = "/vote/create"
VOTE_ROUTE = "/vote"


@pytest.mark.asyncio
async def test_create_vote_success(client: AsyncClient, test_user, test_report):
    vote_data = {
        "user_id": test_user.id,
        "report_id": test_report.id,
        "is_positive": True,
    }
    response = await client.post(VOTE_CREATE_ROUTE, json=vote_data)
    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == vote_data["user_id"]
    assert data["report_id"] == vote_data["report_id"]
    assert data["is_positive"] is True
    assert "id" in data


@pytest.mark.asyncio
async def test_create_vote_permission_denied(client: AsyncClient, test_user):
    vote_data = {
        "user_id": test_user.id + 1,
        "report_id": 1,
        "is_positive": True,
    }
    response = await client.post(VOTE_CREATE_ROUTE, json=vote_data)
    assert response.status_code == 403
    assert response.json()["detail"] == "No permission to create"


@pytest.mark.asyncio
async def test_create_vote_unique_violation(
    client: AsyncClient, test_user, test_report, db_session
):
    new_vote = Vote(user_id=test_user.id, report_id=test_report.id, is_positive=True)
    db_session.add(new_vote)
    await db_session.commit()
    await db_session.flush(new_vote)

    vote_data = {
        "user_id": test_user.id,
        "report_id": test_report.id,
        "is_positive": True,
    }
    response = await client.post(VOTE_CREATE_ROUTE, json=vote_data)
    assert response.status_code == 400
    assert response.json()["detail"] == "Vote is not unique"


@pytest.mark.asyncio
async def test_create_vote_foreign_key_violation(
    client: AsyncClient,
    test_user,
):
    vote_data = {
        "user_id": test_user.id,
        "report_id": 99999,
        "is_positive": True,
    }
    response = await client.post(VOTE_CREATE_ROUTE, json=vote_data)
    assert response.status_code == 404
    assert response.json()["detail"] == "Referenced Report not found"


@pytest.mark.asyncio
async def test_get_vote_success(client: AsyncClient, test_user, test_report, test_vote):
    params = {"user_id": test_user.id, "report_id": test_report.id}
    response = await client.get(VOTE_ROUTE, params=params)
    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == test_user.id
    assert data["report_id"] == test_report.id
    assert "id" in data


@pytest.mark.asyncio
async def test_get_vote_not_found(client: AsyncClient, test_user, test_report):
    params = {"user_id": test_user.id, "report_id": 999999}
    response = await client.get(VOTE_ROUTE, params=params)
    assert response.status_code == 404
    assert response.json()["detail"] == "Vote not found"


@pytest.mark.asyncio
async def test_get_vote_forbidden(
    client: AsyncClient, test_user, test_report, db_session
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
    params = {"user_id": other_user.id, "report_id": test_report.id}
    response = await client.get(VOTE_ROUTE, params=params)
    assert response.status_code == 403
    assert response.json()["detail"] == "No permission to retrieve"


@pytest.mark.asyncio
async def test_admin_get_vote(client: AsyncClient, admin_user, test_report, test_vote):
    params = {"user_id": test_vote.user_id, "report_id": test_vote.report_id}
    response = await client.get(VOTE_ROUTE, params=params)

    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == test_vote.user_id
    assert data["report_id"] == test_vote.report_id


@pytest.mark.asyncio
async def test_patch_vote_success(client: AsyncClient, test_user, test_vote):
    payload = {
        "user_id": test_user.id,
        "report_id": test_vote.report_id,
        "is_positive": not test_vote.is_positive,
    }

    response = await client.patch(VOTE_ROUTE, json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == test_user.id
    assert data["report_id"] == test_vote.report_id
    assert data["is_positive"] == payload["is_positive"]


@pytest.mark.asyncio
async def test_patch_vote_not_found(client: AsyncClient, test_user):
    payload = {
        "user_id": test_user.id,
        "report_id": 999999,
        "is_positive": True,
    }

    response = await client.patch(VOTE_ROUTE, json=payload)
    assert response.status_code == 404
    assert response.json()["detail"] == "Vote not found"


@pytest.mark.asyncio
async def test_patch_vote_forbidden(
    client: AsyncClient, test_user, test_vote, db_session
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

    payload = {
        "user_id": other_user.id,
        "report_id": test_vote.report_id,
        "is_positive": not test_vote.is_positive,
    }

    response = await client.patch(VOTE_ROUTE, json=payload)
    assert response.status_code == 403
    assert response.json()["detail"] == "No permission to update"


@pytest.mark.asyncio
async def test_admin_patch_vote(client: AsyncClient, admin_user, test_vote):
    payload = {
        "user_id": test_vote.user_id,
        "report_id": test_vote.report_id,
        "is_positive": not test_vote.is_positive,
    }

    response = await client.patch(VOTE_ROUTE, json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == test_vote.user_id
    assert data["report_id"] == test_vote.report_id
    assert data["is_positive"] == payload["is_positive"]


@pytest.mark.asyncio
async def test_delete_vote_success(client: AsyncClient, test_user, test_vote):
    response = await client.delete(
        VOTE_ROUTE,
        params={"user_id": test_user.id, "report_id": test_vote.report_id},
    )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_delete_vote_not_found(client: AsyncClient, test_user):
    response = await client.delete(
        VOTE_ROUTE,
        params={"user_id": test_user.id, "report_id": 999999},
    )
    assert response.status_code == 404
    assert response.json()["detail"] == "Vote not found"


@pytest.mark.asyncio
async def test_delete_vote_forbidden(client: AsyncClient, test_vote, db_session):
    other_user = User(
        email="other@example.com",
        first_name="Other",
        hashed_password="hashedpassword",
        is_admin=False,
    )
    db_session.add(other_user)
    await db_session.commit()
    await db_session.refresh(other_user)

    response = await client.delete(
        VOTE_ROUTE,
        params={"user_id": other_user.id, "report_id": test_vote.report_id},
    )
    assert response.status_code == 403
    assert response.json()["detail"] == "No permission to delete"


@pytest.mark.asyncio
async def test_delete_vote_admin(client: AsyncClient, admin_user, test_vote):
    response = await client.delete(
        VOTE_ROUTE,
        params={"user_id": test_vote.user_id, "report_id": test_vote.report_id},
    )

    assert response.status_code == 200
