import os
import uuid
from typing import AsyncGenerator

from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.db.base import Base
from app.db.models.user import User

load_dotenv()

DB_USER = os.getenv("TEST_DB_USER", "user")
DB_PASSWORD = os.getenv("TEST_DB_PASSWORD", "password")
DB_HOST = os.getenv("TEST_DB_HOST", "localhost")
DB_PORT = os.getenv("TEST_DB_PORT", "5432")
DB_NAME = os.getenv("TEST_DB_NAME", "myapp_test")

TEST_DATABASE_URL = (
    f"postgresql+asyncpg://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

engine_test = create_async_engine(TEST_DATABASE_URL, echo=False, future=True)
AsyncSessionLocal = async_sessionmaker(
    engine_test, expire_on_commit=False, class_=AsyncSession
)


async def createTestDbSession() -> AsyncGenerator[AsyncSession, None]:
    """Yield a fresh async DB session connected to the test database."""
    async with AsyncSessionLocal() as session:
        yield session


async def initTestDb():
    """Drop and create all tables in the test database."""
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)


def fakeUser() -> User:
    """Return a fake User instance for tests."""
    return User(
        username="testuser",
        first_name="test",
        email="testuser@example.com",
        hashed_password="not_a_real_hash",
    )
