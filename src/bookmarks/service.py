from typing import List, Optional
from uuid import UUID

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc

from src.models import Bookmark, BookmarkType as BookmarkTypeModel, Novel, Chapter
from src.bookmarks.schemas import BookmarkCreate, BookmarkUpdate
from src.bookmarks.exceptions import BookmarkNotFoundError, BookmarkAlreadyExistsError


def create_bookmark(db: Session, user_id: UUID, data: BookmarkCreate) -> Bookmark:
    """Create a new bookmark for a user"""
    # Check if bookmark already exists
    existing = db.query(Bookmark).filter(
        Bookmark.user_id == user_id,
        Bookmark.novel_id == data.novel_id,
        Bookmark.type == data.type.value
    ).first()
    
    if existing:
        raise BookmarkAlreadyExistsError("Bookmark already exists for this novel")
    
    bookmark = Bookmark(
        user_id=user_id,
        novel_id=data.novel_id,
        type=BookmarkTypeModel(data.type.value),
        chapter_id=data.chapter_id,
        line=data.line,
    )
    db.add(bookmark)
    db.commit()
    db.refresh(bookmark)
    return bookmark


def get_bookmark(db: Session, bookmark_id: UUID, user_id: UUID) -> Optional[Bookmark]:
    """Get a bookmark by ID (user must own it)"""
    return (
        db.query(Bookmark)
        .options(
            joinedload(Bookmark.novel),
            joinedload(Bookmark.chapter)
        )
        .filter(Bookmark.id == bookmark_id, Bookmark.user_id == user_id)
        .first()
    )


def list_bookmarks(
    db: Session,
    user_id: UUID,
    skip: int = 0,
    limit: int = 20,
    bookmark_type: Optional[str] = None,
) -> List[Bookmark]:
    """List all bookmarks for a user"""
    query = db.query(Bookmark).options(
        joinedload(Bookmark.novel),
        joinedload(Bookmark.chapter)
    ).filter(Bookmark.user_id == user_id)
    
    if bookmark_type:
        query = query.filter(Bookmark.type == bookmark_type)
    
    query = query.order_by(desc(Bookmark.created_at))
    return query.offset(skip).limit(limit).all()


def update_bookmark(
    db: Session,
    bookmark_id: UUID,
    user_id: UUID,
    data: BookmarkUpdate
) -> Optional[Bookmark]:
    """Update a bookmark (chapter_id and line)"""
    bookmark = db.query(Bookmark).filter(
        Bookmark.id == bookmark_id,
        Bookmark.user_id == user_id
    ).first()
    
    if not bookmark:
        return None
    
    if data.chapter_id is not None:
        bookmark.chapter_id = data.chapter_id
    if data.line is not None:
        bookmark.line = data.line
    
    db.commit()
    db.refresh(bookmark)
    return bookmark


def delete_bookmark(db: Session, bookmark_id: UUID, user_id: UUID) -> bool:
    """Delete a bookmark (user must own it)"""
    bookmark = db.query(Bookmark).filter(
        Bookmark.id == bookmark_id,
        Bookmark.user_id == user_id
    ).first()
    
    if not bookmark:
        return False
    
    db.delete(bookmark)
    db.commit()
    return True


def delete_bookmark_by_novel(db: Session, user_id: UUID, novel_id: UUID) -> bool:
    """Delete all bookmarks for a novel"""
    bookmarks = db.query(Bookmark).filter(
        Bookmark.user_id == user_id,
        Bookmark.novel_id == novel_id
    ).all()
    
    if not bookmarks:
        return False
    
    for bookmark in bookmarks:
        db.delete(bookmark)
    
    db.commit()
    return True

