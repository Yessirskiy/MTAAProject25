from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, AsyncAttrs
from sqlalchemy.orm import sessionmaker, DeclarativeBase

# from app.core.config import settings


class Base(AsyncAttrs, DeclarativeBase): ...


engine = create_async_engine(
    "postgresql+asyncpg://postgres:safe/pswd=1@localhost/mtaa", echo=True
)
async_session = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)


async def getSession() -> AsyncSession:
    async with async_session() as session:
        yield session
