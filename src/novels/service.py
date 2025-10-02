from typing import List, Optional, Sequence
from uuid import UUID

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, func, asc, desc

from src.models import Novel, Volume, Chapter
from .schemas import NovelCreate, NovelUpdate


def create_novel(db: Session, data: NovelCreate) -> Novel:
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
    db.commit()
    db.refresh(novel)
    return novel


def get_novel_detail(db: Session, novel_id: UUID) -> Optional[Novel]:
    return (
        db.query(Novel)
        .options(
            joinedload(Novel.volumes).joinedload(Volume.chapters)
        )
        .filter(Novel.id == novel_id)
        .first()
    )


def get_novel(db: Session, novel_id: UUID) -> Optional[Novel]:
    return db.query(Novel).filter(Novel.id == novel_id).first()


def get_novel_by_title(db: Session, title: str) -> Optional[Novel]:
    return db.query(Novel).filter(Novel.title == title).first()


def list_novels(
    db: Session,
    skip: int = 0,
    limit: int = 50,
    keyword: Optional[str] = None,
    statuses: Optional[Sequence[str]] = None,
    sort_by: str = "last_updated",
    sort_dir: str = "desc",
) -> List[Novel]:
    q = db.query(Novel)

    if keyword:
        pattern = f"%{keyword}%"
        q = q.filter(
            or_(
                Novel.title.ilike(pattern),
                func.array_to_string(Novel.other_titles, " ").ilike(pattern),
            )
        )

    if statuses:
        q = q.filter(Novel.status.in_(list(statuses)))

    sort_map = {
        "status": Novel.status,
        "title": Novel.title,
        "last_updated": Novel.last_updated,
    }
    sort_col = sort_map.get(sort_by, Novel.last_updated)
    order_expr = asc(sort_col) if sort_dir.lower() == "asc" else desc(sort_col)

    q = q.order_by(order_expr).offset(skip).limit(limit)
    return q.all()


def update_novel(db: Session, novel_id: UUID, data: NovelUpdate) -> Optional[Novel]:
    novel = db.query(Novel).filter(Novel.id == novel_id).first()
    if not novel:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(novel, field, value)
    db.add(novel)
    db.commit()
    db.refresh(novel)
    return novel


def delete_novel(db: Session, novel_id: UUID) -> bool:
    novel = db.query(Novel).filter(Novel.id == novel_id).first()
    if not novel:
        return False
    db.delete(novel)
    db.commit()
    return True


