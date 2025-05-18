from pathlib import Path
from fastapi.responses import FileResponse
import pytest
import json
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.user import User
from app.db.models.report import Report, ReportAddress, ReportPhoto
from app.dependencies.common import getSettings

REPORT_CREATE_URL = "/report/create"
REPORT_ROUTE = "/report/{report_id}"
REPORT_PHOTO_ROUTE = "/report/photo/{photo_id}"


@pytest.mark.asyncio
async def test_create_report_invalid_json(
    client: AsyncClient, test_user: User, tmp_path
):
    bad_json = "this is not json"

    photo_file = tmp_path / "test.jpg"
    photo_file.write_bytes(b"fake image content")

    with photo_file.open("rb") as f:
        response = await client.post(
            REPORT_CREATE_URL,
            data={"reportcreatestr": bad_json},
            files={"photos": ("test.jpg", f, "image/jpeg")},
        )

    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid ReportCreate Form"


@pytest.mark.asyncio
async def test_create_report_missing_required_field(
    client: AsyncClient, test_user: User, tmp_path
):
    report_create_data = {
        "user_id": test_user.id,
        "address": {
            "building": "1A",
            "street": "Main Street",
            "city": "Sampletown",
            "state": "CA",
            "postal_code": "12345",
            "country": "Neverland",
            "latitude": 48.123456,
            "longitude": 17.654321,
        },
    }

    photo_file = tmp_path / "test.jpg"
    photo_file.write_bytes(b"fake image content")

    with photo_file.open("rb") as f:
        response = await client.post(
            REPORT_CREATE_URL,
            data={"reportcreatestr": json.dumps(report_create_data)},
            files={"photos": ("test.jpg", f, "image/jpeg")},
        )

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_create_report_invalid_user_id(
    client: AsyncClient, test_user: User, tmp_path
):
    report_create_data = {
        "user_id": test_user.id + 999,
        "note": "Test report note",
        "address": {
            "building": "1A",
            "street": "Main Street",
            "city": "Sampletown",
            "state": "CA",
            "postal_code": "12345",
            "country": "Neverland",
            "latitude": 48.123456,
            "longitude": 17.654321,
        },
    }

    photo_file = tmp_path / "test.jpg"
    photo_file.write_bytes(b"fake image content")

    with photo_file.open("rb") as f:
        response = await client.post(
            REPORT_CREATE_URL,
            data={"reportcreatestr": json.dumps(report_create_data)},
            files={"photos": ("test.jpg", f, "image/jpeg")},
        )

    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid user_id"


@pytest.mark.asyncio
async def test_create_report_with_empty_photos(client: AsyncClient, test_user: User):
    report_create_data = {
        "user_id": test_user.id,
        "note": "Test note with no photo",
        "address": {
            "building": "1A",
            "street": "Main Street",
            "city": "Sampletown",
            "state": "CA",
            "postal_code": "12345",
            "country": "Neverland",
            "latitude": 48.123456,
            "longitude": 17.654321,
        },
    }

    response = await client.post(
        REPORT_CREATE_URL,
        data={"reportcreatestr": json.dumps(report_create_data)},
        files={},
    )

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_get_report_success(
    client: AsyncClient, db_session: AsyncSession, test_user: User
):
    report = Report(user_id=test_user.id, note="Sample report")
    db_session.add(report)
    await db_session.flush()

    address = ReportAddress(
        report_id=report.id,
        city="Cityville",
        street="Example Street",
        country="Testland",
        latitude=48.123456,
        longitude=17.654321,
    )
    db_session.add(address)

    photo = ReportPhoto(report_id=report.id, filename_path="sample.jpg")
    db_session.add(photo)

    await db_session.commit()
    await db_session.refresh(report)

    response = await client.get(REPORT_ROUTE.format(report_id=report.id))
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == report.id
    assert data["note"] == "Sample report"
    assert data["address"]["city"] == "Cityville"
    assert len(data["photos"]) == 1


@pytest.mark.asyncio
async def test_get_report_not_found(client: AsyncClient, test_user: User):
    response = await client.get(REPORT_ROUTE.format(report_id=99999))
    assert response.status_code == 404
    assert response.json()["detail"] == "Report not found"


@pytest.mark.asyncio
async def test_update_report_success(
    client: AsyncClient, test_user, db_session: AsyncSession
):
    report = Report(user_id=test_user.id, note="Sample report")
    db_session.add(report)
    await db_session.flush()

    address = ReportAddress(
        report_id=report.id,
        city="Cityville",
        street="Example Street",
        country="Testland",
        latitude=48.123456,
        longitude=17.654321,
    )
    db_session.add(address)

    photo = ReportPhoto(report_id=report.id, filename_path="sample.jpg")
    db_session.add(photo)

    await db_session.commit()
    await db_session.refresh(report)

    update_data = {"note": "Updated note"}

    response = await client.put(
        REPORT_ROUTE.format(report_id=report.id),
        json=update_data,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == report.id
    assert data["note"] == "Updated note"


@pytest.mark.asyncio
async def test_update_report_not_found(client: AsyncClient):
    update_data = {"note": "Doesn't matter"}

    response = await client.put(
        REPORT_ROUTE.format(report_id=999999),
        json=update_data,
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Report not found"


@pytest.mark.asyncio
async def test_update_report_no_permission(
    client: AsyncClient, db_session: AsyncSession, test_user
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

    report = Report(user_id=other_user.id, note="Old note")
    db_session.add(report)
    await db_session.commit()
    await db_session.refresh(report)

    update_data = {"note": "Trying to update"}

    response = await client.put(
        REPORT_ROUTE.format(report_id=report.id),
        json=update_data,
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "No permission to update"


@pytest.mark.asyncio
async def test_delete_report_success(
    client: AsyncClient, test_user, db_session: AsyncSession
):
    report = Report(user_id=test_user.id, note="Sample report")
    db_session.add(report)
    await db_session.flush()

    address = ReportAddress(
        report_id=report.id,
        city="Cityville",
        street="Example Street",
        country="Testland",
        latitude=48.123456,
        longitude=17.654321,
    )
    db_session.add(address)

    photo = ReportPhoto(report_id=report.id, filename_path="sample.jpg")
    db_session.add(photo)

    await db_session.commit()

    response = await client.delete(REPORT_ROUTE.format(report_id=report.id))
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_delete_report_not_found(client: AsyncClient):
    response = await client.delete(REPORT_ROUTE.format(report_id=999999))
    assert response.status_code == 404
    assert response.json()["detail"] == "Report not found"


@pytest.mark.asyncio
async def test_delete_report_no_permission(
    client: AsyncClient, db_session: AsyncSession
):
    other_user = User(
        email="other@example.com",
        first_name="Other",
        hashed_password="hashedpassword",
        is_admin=False,
    )
    db_session.add(other_user)
    await db_session.flush()

    report = Report(user_id=other_user.id, note="Sample report")
    db_session.add(report)
    await db_session.flush()

    address = ReportAddress(
        report_id=report.id,
        city="Cityville",
        street="Example Street",
        country="Testland",
        latitude=48.123456,
        longitude=17.654321,
    )
    db_session.add(address)

    photo = ReportPhoto(report_id=report.id, filename_path="sample.jpg")
    db_session.add(photo)
    await db_session.commit()

    response = await client.delete(REPORT_ROUTE.format(report_id=report.id))
    assert response.status_code == 403
    assert response.json()["detail"] == "No permission to update"


@pytest.mark.asyncio
async def test_get_report_photo_success(client: AsyncClient, test_user, db_session):
    settings = getSettings()
    temp_dir = Path(settings.REPORT_PHOTOS)
    temp_dir.mkdir(parents=True, exist_ok=True)

    photo_filename = "test_photo.jpg"
    photo_path = temp_dir / photo_filename
    photo_path.write_bytes(b"fake image content")

    report = Report(user_id=test_user.id, note="Sample report")
    db_session.add(report)
    await db_session.flush()

    photo = ReportPhoto(report_id=report.id, filename_path=photo_filename)
    db_session.add(photo)
    await db_session.commit()
    await db_session.refresh(photo)

    response = await client.get(REPORT_PHOTO_ROUTE.format(photo_id=photo.id))
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("image/")


@pytest.mark.asyncio
async def test_get_report_photo_not_found(client: AsyncClient):
    response = await client.get(REPORT_PHOTO_ROUTE.format(photo_id=999999))
    assert response.status_code == 404
    assert response.json()["detail"] == "Photo not found"


@pytest.mark.asyncio
async def test_get_report_photo_file_missing(
    client: AsyncClient, test_user, db_session
):
    report = Report(user_id=test_user.id, note="Sample report")
    db_session.add(report)
    await db_session.flush()
    photo = ReportPhoto(report_id=report.id, filename_path="missing_photo.jpg")
    db_session.add(photo)
    await db_session.commit()
    await db_session.refresh(photo)

    response = await client.get(REPORT_PHOTO_ROUTE.format(photo_id=photo.id))
    assert response.status_code == 500
