from typing import List, Optional
from uuid import UUID
from datetime import datetime, timedelta
from src.chapters import service as chapter_service
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, and_

from src.models import History, Novel, Chapter
from src.histories.schemas import HistoryCreate


def create_history(db: Session, user_id: UUID, data: HistoryCreate) -> History:
    """Create or update reading history"""
    # Check if history already exists for this user, novel, and chapter
    existing = db.query(History).filter(
        History.user_id == user_id,
        History.novel_id == data.novel_id,
        History.chapter_id == data.chapter_id,
    ).first()
    
    if existing:
        # Update timestamp by deleting and recreating
        db.delete(existing)
        db.commit()
    
    history = History(
        user_id=user_id,
        novel_id=data.novel_id,
        chapter_id=data.chapter_id,
    )
    db.add(history)
    db.commit()
    db.refresh(history)
    return history


def get_history(db: Session, history_id: UUID, user_id: UUID) -> Optional[History]:
    """Get a history entry by ID"""
    return (
        db.query(History)
        .options(
            joinedload(History.novel),
            joinedload(History.chapter)
        )
        .filter(History.id == history_id, History.user_id == user_id)
        .first()
    )


def list_histories(
    db: Session,
    user_id: UUID,
    skip: int = 0,
    limit: int = 20,
    novel_id: Optional[UUID] = None,
) -> List[History]:
    """List reading history for a user"""
    query = db.query(History).options(
        joinedload(History.novel),
        joinedload(History.chapter)
    ).filter(History.user_id == user_id)
    
    if novel_id:
        query = query.filter(History.novel_id == novel_id)
    
    query = query.order_by(desc(History.created_at))
    return query.offset(skip).limit(limit).all()


def get_last_read_chapter(db: Session, user_id: UUID, novel_id: UUID) -> Optional[History]:
    """Get the last chapter read for a novel"""
    return (
        db.query(History)
        .options(joinedload(History.chapter))
        .filter(
            History.user_id == user_id,
            History.novel_id == novel_id
        )
        .order_by(desc(History.created_at))
        .first()
    )


def delete_history(db: Session, history_id: UUID, user_id: UUID) -> bool:
    """Delete a history entry"""
    history = db.query(History).filter(
        History.id == history_id,
        History.user_id == user_id
    ).first()
    
    if not history:
        return False
    
    db.delete(history)
    db.commit()
    return True


def delete_all_history(db: Session, user_id: UUID) -> bool:
    """Delete all history for a user"""
    histories = db.query(History).filter(History.user_id == user_id).all()
    
    if not histories:
        return False
    
    for history in histories:
        db.delete(history)
    
    db.commit()
    return True


def delete_history_by_novel(db: Session, user_id: UUID, novel_id: UUID) -> bool:
    """Delete all history entries for a specific novel"""
    histories = db.query(History).filter(
        History.user_id == user_id,
        History.novel_id == novel_id
    ).all()
    
    if not histories:
        return False
    
    for history in histories:
        db.delete(history)
    
    db.commit()
    return True

