from typing import List, Optional
from uuid import UUID
from datetime import datetime, timedelta
from src.chapters import service as chapter_service
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import desc, and_, select

from src.models import History, Novel, Chapter
from src.histories.schemas import HistoryCreate


async def create_history(db: AsyncSession, user_id: UUID, data: HistoryCreate) -> History:
    """Create or update reading history"""
    # Check if history already exists for this user, novel, and chapter
    stmt = select(History).filter(
        History.user_id == user_id,
        History.novel_id == data.novel_id,
        History.chapter_id == data.chapter_id,
    )
    result = await db.execute(stmt)
    existing = result.scalar_one_or_none()
    
    if existing:
        # Update timestamp by deleting and recreating
        await db.delete(existing)
        await db.commit()
    
    history = History(
        user_id=user_id,
        novel_id=data.novel_id,
        chapter_id=data.chapter_id,
    )
    db.add(history)
    await db.commit()
    await db.refresh(history)
    return history


async def get_history(db: AsyncSession, history_id: UUID, user_id: UUID) -> Optional[History]:
    """Get a history entry by ID"""
    stmt = (
        select(History)
        .options(
            selectinload(History.novel),
            selectinload(History.chapter)
        )
        .filter(History.id == history_id, History.user_id == user_id)
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def list_histories(
    db: AsyncSession,
    user_id: UUID,
    skip: int = 0,
    limit: int = 20,
    novel_id: Optional[UUID] = None,
) -> List[History]:
    """List reading history for a user"""
    stmt = select(History).options(
        selectinload(History.novel),
        selectinload(History.chapter)
    ).filter(History.user_id == user_id)
    
    if novel_id:
        stmt = stmt.filter(History.novel_id == novel_id)
    
    stmt = stmt.order_by(desc(History.created_at)).offset(skip).limit(limit)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_last_read_chapter(db: AsyncSession, user_id: UUID, novel_id: UUID) -> Optional[History]:
    """Get the last chapter read for a novel"""
    stmt = (
        select(History)
        .options(selectinload(History.chapter))
        .filter(
            History.user_id == user_id,
            History.novel_id == novel_id
        )
        .order_by(desc(History.created_at))
    )
    result = await db.execute(stmt)
    return result.scalars().first()


async def delete_history(db: AsyncSession, history_id: UUID, user_id: UUID) -> bool:
    """Delete a history entry"""
    stmt = select(History).filter(
        History.id == history_id,
        History.user_id == user_id
    )
    result = await db.execute(stmt)
    history = result.scalar_one_or_none()
    
    if not history:
        return False
    
    await db.delete(history)
    await db.commit()
    return True


async def delete_all_history(db: AsyncSession, user_id: UUID) -> bool:
    """Delete all history for a user"""
    stmt = select(History).filter(History.user_id == user_id)
    result = await db.execute(stmt)
    histories = list(result.scalars().all())
    
    if not histories:
        return False
    
    for history in histories:
        await db.delete(history)
    
    await db.commit()
    return True


async def delete_history_by_novel(db: AsyncSession, user_id: UUID, novel_id: UUID) -> bool:
    """Delete all history entries for a specific novel"""
    stmt = select(History).filter(
        History.user_id == user_id,
        History.novel_id == novel_id
    )
    result = await db.execute(stmt)
    histories = list(result.scalars().all())
    
    if not histories:
        return False
    
    for history in histories:
        await db.delete(history)
    
    await db.commit()
    return True

