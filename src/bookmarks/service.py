from typing import List, Optional
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import desc, select

from src.models import Bookmark, BookmarkType as BookmarkTypeModel, Novel, Chapter
from src.bookmarks.schemas import BookmarkCreate, BookmarkUpdate
from src.bookmarks.exceptions import BookmarkNotFoundError, BookmarkAlreadyExistsError


async def create_bookmark(db: AsyncSession, user_id: UUID, data: BookmarkCreate) -> Bookmark:
    """Create a new bookmark for a user"""
    # Check if bookmark already exists
    stmt = select(Bookmark).filter(
        Bookmark.user_id == user_id,
        Bookmark.novel_id == data.novel_id,
        Bookmark.type == data.type.value
    )
    result = await db.execute(stmt)
    existing = result.scalar_one_or_none()
    
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
    await db.commit()
    await db.refresh(bookmark)
    return bookmark


async def get_bookmark(db: AsyncSession, bookmark_id: UUID, user_id: UUID) -> Optional[Bookmark]:
    """Get a bookmark by ID (user must own it)"""
    stmt = (
        select(Bookmark)
        .options(
            selectinload(Bookmark.novel),
            selectinload(Bookmark.chapter)
        )
        .filter(Bookmark.id == bookmark_id, Bookmark.user_id == user_id)
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def list_bookmarks(
    db: AsyncSession,
    user_id: UUID,
    skip: int = 0,
    limit: int = 20,
    bookmark_type: Optional[str] = None,
) -> List[Bookmark]:
    """List all bookmarks for a user"""
    stmt = select(Bookmark).options(
        selectinload(Bookmark.novel),
        selectinload(Bookmark.chapter)
    ).filter(Bookmark.user_id == user_id)
    
    if bookmark_type:
        stmt = stmt.filter(Bookmark.type == bookmark_type)
    
    stmt = stmt.order_by(desc(Bookmark.created_at)).offset(skip).limit(limit)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def update_bookmark(
    db: AsyncSession,
    bookmark_id: UUID,
    user_id: UUID,
    data: BookmarkUpdate
) -> Optional[Bookmark]:
    """Update a bookmark (chapter_id and line)"""
    stmt = select(Bookmark).filter(
        Bookmark.id == bookmark_id,
        Bookmark.user_id == user_id
    )
    result = await db.execute(stmt)
    bookmark = result.scalar_one_or_none()
    
    if not bookmark:
        return None
    
    if data.chapter_id is not None:
        bookmark.chapter_id = data.chapter_id
    if data.line is not None:
        bookmark.line = data.line
    
    await db.commit()
    await db.refresh(bookmark)
    return bookmark


async def delete_bookmark(db: AsyncSession, bookmark_id: UUID, user_id: UUID) -> bool:
    """Delete a bookmark (user must own it)"""
    stmt = select(Bookmark).filter(
        Bookmark.id == bookmark_id,
        Bookmark.user_id == user_id
    )
    result = await db.execute(stmt)
    bookmark = result.scalar_one_or_none()
    
    if not bookmark:
        return False
    
    await db.delete(bookmark)
    await db.commit()
    return True


async def delete_bookmark_by_novel(db: AsyncSession, user_id: UUID, novel_id: UUID) -> bool:
    """Delete all bookmarks for a novel"""
    stmt = select(Bookmark).filter(
        Bookmark.user_id == user_id,
        Bookmark.novel_id == novel_id
    )
    result = await db.execute(stmt)
    bookmarks = list(result.scalars().all())
    
    if not bookmarks:
        return False
    
    for bookmark in bookmarks:
        await db.delete(bookmark)
    
    await db.commit()
    return True

