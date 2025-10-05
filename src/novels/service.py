from typing import List, Optional, Sequence
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload, selectinload
from sqlalchemy import or_, func, asc, desc, select

from src.models import Novel, Volume, Chapter
from src.utils import measure_time
from .schemas import NovelBrief, NovelCreate, NovelUpdate, NovelQuery


async def create_novel(db: AsyncSession, data: NovelCreate) -> Novel:
    novel = Novel(
        title=data.title,
        other_titles=data.other_titles,
        authors=data.authors,
        tags=data.tags,
        type=data.type,
        artists=data.artists,
        status=data.status,
        description=data.description,
        meta=data.meta,
        image_url=data.image_url,
    )
    db.add(novel)
    await db.commit()
    await db.refresh(novel)
    return novel


async def get_novel_detail(db: AsyncSession, novel_id: UUID) -> Optional[Novel]:
    stmt = (
        select(Novel)
        .options(
            selectinload(Novel.volumes).selectinload(Volume.chapters)
        )
        .filter(Novel.id == novel_id)
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_novel(db: AsyncSession, novel_id: UUID) -> Optional[Novel]:
    stmt = select(Novel).filter(Novel.id == novel_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_novel_by_title(db: AsyncSession, title: str) -> Optional[Novel]:
    stmt = select(Novel).filter(Novel.title == title)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()



@measure_time
async def list_novels(
    db: AsyncSession,
    query: NovelQuery
) -> List[Novel]:
    exclude_cols = {"description"}
    cols = [col for col in Novel.__table__.columns if col.name not in exclude_cols]


    stmt = select(*cols)
    skip = query.skip
    limit = query.limit
    keyword = query.keyword
    statuses = query.statuses
    author = query.author
    tags = query.tags
    artist = query.artist
    type = query.type
    sort_by = query.sort_by
    sort_dir = query.sort_dir
    if query.keyword:
        pattern = f"%{keyword}%"
        stmt = stmt.filter(
            or_(
                Novel.title.ilike(pattern),
                func.array_to_string(Novel.other_titles, " ").ilike(pattern),
            )
        )

    if statuses:
        stmt = stmt.filter(Novel.status.in_(list(statuses)))

    if author:
        stmt = stmt.filter(Novel.authors.contains(author))

    # todo: add tags

    if artist:
        stmt = stmt.filter(Novel.artists.contains(artist))

    if type:
        stmt = stmt.filter(Novel.type == type)

    sort_map = {
        "status": Novel.status,
        "title": Novel.title,
        "last_updated": Novel.last_updated,
        "views": Novel.total_views,
        "average_rating": Novel.average_rating,
        "favorites": Novel.total_favorites,
    }
    sort_col = sort_map.get(sort_by, Novel.last_updated)
    order_expr = asc(sort_col) if sort_dir.lower() == "asc" else desc(sort_col)

    stmt = stmt.order_by(order_expr).offset(skip).limit(limit)
    result = await db.execute(stmt)
    return list(result.mappings().all())


async def update_novel(db: AsyncSession, novel_id: UUID, data: NovelUpdate) -> Optional[Novel]:
    stmt = select(Novel).filter(Novel.id == novel_id)
    result = await db.execute(stmt)
    novel = result.scalar_one_or_none()
    if not novel:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(novel, field, value)
    db.add(novel)
    await db.commit()
    await db.refresh(novel)
    return novel


async def delete_novel(db: AsyncSession, novel_id: UUID) -> bool:
    stmt = select(Novel).filter(Novel.id == novel_id)
    result = await db.execute(stmt)
    novel = result.scalar_one_or_none()
    if not novel:
        return False
    await db.delete(novel)
    await db.commit()
    return True


