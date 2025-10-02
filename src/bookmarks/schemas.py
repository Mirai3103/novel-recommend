from typing import Any, Dict, List, Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field
from enum import Enum


class BookmarkTypeEnum(str, Enum):
    NOVEL = "novel"
    CHAPTER = "chapter"


class BookmarkBase(BaseModel):
    novel_id: UUID
    type: BookmarkTypeEnum
    chapter_id: Optional[UUID] = None
    line: Optional[int] = None


class BookmarkCreate(BookmarkBase):
    pass


class BookmarkUpdate(BaseModel):
    chapter_id: Optional[UUID] = None
    line: Optional[int] = None


class BookmarkOut(BookmarkBase):
    id: UUID
    user_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class NovelBrief(BaseModel):
    id: UUID
    title: str
    image_url: Optional[str] = None
    authors: Optional[List[str]] = None

    class Config:
        from_attributes = True


class ChapterBrief(BaseModel):
    id: UUID
    title: Optional[str] = None
    order: Optional[int] = None

    class Config:
        from_attributes = True


class BookmarkDetail(BookmarkOut):
    novel: NovelBrief
    chapter: Optional[ChapterBrief] = None

    class Config:
        from_attributes = True

