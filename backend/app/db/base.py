from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, AsyncAttrs
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from app.dependencies.common import getSettings


class Base(AsyncAttrs, DeclarativeBase): ...


engine = create_async_engine(getSettings().DATABASE_URL, echo=True)
async_session = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)


async def init_models():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)


async def getSession() -> AsyncSession:
    async with async_session() as session:
        yield session
