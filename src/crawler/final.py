from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
import asyncio
from datetime import datetime

from database import get_async_db

from src.models import Novel, Volume, Chapter
from src.database import AsyncSessionLocal


async def update_latest_chapters():
    async with AsyncSessionLocal() as session:
        # Lấy tất cả novels, chỉ cần id
        result = await session.execute(select(Novel.id))
        novels = result.scalars().all()

        for novel_id in novels:
            # Lấy volume có order lớn nhất của novel này
            volume_result = await session.execute(
                select(Volume.id)
                .where(Volume.novel_id == novel_id)
                .order_by(Volume.order.desc())
                .limit(1)
            )
            volume = volume_result.scalar()
            if not volume:
                continue

            # Lấy chapter có order lớn nhất trong volume đó
            chapter_result = await session.execute(
                select(Chapter.id)
                .where(Chapter.volume_id == volume)
                .order_by(Chapter.order.desc())
                .limit(1)
            )
            chapter = chapter_result.scalar()
            if not chapter:
                continue

            # Update latest_chapter_id và last_updated
            await session.execute(
                (
                    Novel.__table__.update()
                    .where(Novel.id == novel_id)
                    .values(latest_chapter_id=chapter, last_updated=datetime.utcnow())
                )
            )

        await session.commit()


# Nếu cần chạy trong FastAPI background task
async def run_update_latest_chapters():
    async for db in get_async_db():
        await update_latest_chapters()

if __name__ == "__main__":
    asyncio.run(run_update_latest_chapters())