import asyncio
import os
from httpx import ASGITransport, AsyncClient
import pytest_asyncio
import pytest
from pathlib import Path
from app.main import app
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.db.base import Base
from app.db.models.user import User
from app.db.base import getSession
from app.dependencies.auth import getUser
from app.dependencies.common import getSettings
from app.utils.passwords import hashPassword

from dotenv import load_dotenv

load_dotenv()

DB_USER = os.getenv("TEST_DB_USER", "user")
DB_PASSWORD = os.getenv("TEST_DB_PASSWORD", "password")
DB_HOST = os.getenv("TEST_DB_HOST", "localhost")
DB_PORT = os.getenv("TEST_DB_PORT", "5432")
DB_NAME = os.getenv("TEST_DB_NAME", "myapp_test")

TEST_DATABASE_URL = (
    f"postgresql+asyncpg://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

engine_test = create_async_engine(TEST_DATABASE_URL, echo=False)
TestingSessionLocal = async_sessionmaker(
    engine_test, expire_on_commit=False, class_=AsyncSession
)


async def override_getSession() -> AsyncSession:
    async with TestingSessionLocal() as session:
        yield session


app.dependency_overrides[getSession] = override_getSession


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="function")
async def setup_and_teardown_db():
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture(scope="function")
async def db_session(setup_and_teardown_db):
    async with TestingSessionLocal() as session:
        yield session


# @pytest_asyncio.fixture(autouse=True, scope="function")
# async def setup_and_teardown_db():
#     async with engine_test.begin() as conn:
#         await conn.run_sync(Base.metadata.create_all)
#     yield
#     async with engine_test.begin() as conn:
#         await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def test_user(db_session, tmp_path: Path):
    file_path = tmp_path / "profile.jpg"
    file_path.write_text("fake image content")
    user = User(
        email="testuser@example.com",
        first_name="Test",
        hashed_password=hashPassword("password1234"),
        picture_path=str(file_path),
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
def override_getUser(test_user):
    async def _override():
        return test_user

    return _override


@pytest_asyncio.fixture(autouse=True)
def override_dependencies(override_getUser):
    app.dependency_overrides[getUser] = override_getUser
    yield
    app.dependency_overrides.pop(getUser, None)


@pytest.fixture
def override_user_photos(tmp_path: Path):
    settings = getSettings()
    original_path = settings.USER_PHOTOS
    settings.USER_PHOTOS = tmp_path
    yield
    settings.USER_PHOTOS = original_path


@pytest_asyncio.fixture(scope="function")
async def client():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac
