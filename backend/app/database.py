from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy import text, inspect
from app.config import get_settings

settings = get_settings()

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def migrate_db():
    """Run simple migrations for SQLite."""
    async with engine.begin() as conn:
        await conn.execute(text("PRAGMA foreign_keys=ON"))
        
        # Check if documents table exists and has category column
        result = await conn.execute(text(
            "SELECT COUNT(*) FROM pragma_table_info('documents') WHERE name='category'"
        ))
        has_category = result.scalar() > 0
        
        if not has_category:
            await conn.execute(text(
                "ALTER TABLE documents ADD COLUMN category VARCHAR(50) DEFAULT '未分类'"
            ))

async def init_db():
    async with engine.begin() as conn:
        # Enable foreign key support for SQLite
        await conn.execute(text("PRAGMA foreign_keys=ON"))
        await conn.run_sync(Base.metadata.create_all)
    
    # Run migrations
    await migrate_db()
