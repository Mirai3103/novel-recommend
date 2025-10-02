from typing import List, Optional
from uuid import UUID

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import asc, desc

from src.models import Chapter, Volume, Novel
from src.chapters.schemas import ChapterCreate, ChapterUpdate


def create_chapter(db: Session, data: ChapterCreate) -> Chapter:
    chapter = Chapter(
        volume_id=data.volume_id,
        title=data.title,
        order=data.order,
        meta=data.meta,
        content=data.content,
    )
    db.add(chapter)
    db.commit()
    db.refresh(chapter)
    return chapter


def get_chapter(db: Session, chapter_id: UUID) -> Optional[Chapter]:
    return (
        db.query(Chapter)
        .options(
            joinedload(Chapter.volume).joinedload(Volume.novel)
        )
        .filter(Chapter.id == chapter_id)
        .first()
    )


def list_chapters(
    db: Session,
    volume_id: Optional[UUID] = None,
    skip: int = 0,
    limit: int = 20,
    sort_by: str = "order",
    sort_dir: str = "asc",
) -> List[Chapter]:
    query = db.query(Chapter)
    if volume_id:
        query = query.filter(Chapter.volume_id == volume_id)

    sort_column = Chapter.order if sort_by == "order" else Chapter.last_updated
    if sort_dir == "desc":
        query = query.order_by(desc(sort_column))
    else:
        query = query.order_by(asc(sort_column))

    return query.offset(skip).limit(limit).all()


def update_chapter(db: Session, chapter_id: UUID, data: ChapterUpdate) -> Optional[Chapter]:
    chapter = get_chapter(db, chapter_id)
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
    db.commit()
    db.refresh(chapter)
    return chapter


def delete_chapter(db: Session, chapter_id: UUID) -> bool:
    chapter = get_chapter(db, chapter_id)
    if not chapter:
        return False
    db.delete(chapter)
    db.commit()
    return True


