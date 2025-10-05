from typing import List, Optional
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import asc, desc, select

from src.models import Chapter, Volume, Novel
from src.chapters.schemas import ChapterCreate, ChapterUpdate


async def create_chapter(db: AsyncSession, data: ChapterCreate) -> Chapter:
    chapter = Chapter(
        volume_id=data.volume_id,
        title=data.title,
        order=data.order,
        meta=data.meta,
        content=data.content,
    )
    db.add(chapter)
    await db.commit()
    await db.refresh(chapter)
    return chapter


async def get_chapter(db: AsyncSession, chapter_id: UUID) -> Optional[Chapter]:
    stmt = (
        select(Chapter)
        .options(
            selectinload(Chapter.volume).selectinload(Volume.novel)
        )
        .filter(Chapter.id == chapter_id)
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def list_chapters(
    db: AsyncSession,
    volume_id: Optional[UUID] = None,
    skip: int = 0,
    limit: int = 20,
    sort_by: str = "order",
    sort_dir: str = "asc",
) -> List[Chapter]:
    stmt = select(Chapter)
    if volume_id:
        stmt = stmt.filter(Chapter.volume_id == volume_id)

    sort_column = Chapter.order if sort_by == "order" else Chapter.last_updated
    if sort_dir == "desc":
        stmt = stmt.order_by(desc(sort_column))
    else:
        stmt = stmt.order_by(asc(sort_column))

    stmt = stmt.offset(skip).limit(limit)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def update_chapter(db: AsyncSession, chapter_id: UUID, data: ChapterUpdate) -> Optional[Chapter]:
    chapter = await get_chapter(db, chapter_id)
    if not chapter:
        return None
    if data.title is not None:
        chapter.title = data.title
    if data.order is not None:
        chapter.order = data.order
    if data.meta is not None:
        chapter.meta = data.meta
    if data.content is not None:
        chapter.content = data.content
    await db.commit()
    await db.refresh(chapter)
    return chapter


async def delete_chapter(db: AsyncSession, chapter_id: UUID) -> bool:
    chapter = await get_chapter(db, chapter_id)
    if not chapter:
        return False
    await db.delete(chapter)
    await db.commit()
    return True


