from typing import Any, Dict, List, Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field


class NovelBase(BaseModel):
    title: str = Field(..., min_length=1)
    other_titles: Optional[List[str]] = None
    authors: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    type: Optional[str] = None
    artists: Optional[List[str]] = None
    status: Optional[str] = None
    description: Optional[str] = None
    meta: Optional[Dict[str, Any]] = None
    image_url: Optional[str] = None
    last_updated: Optional[datetime] = None


class NovelCreate(NovelBase):
    pass


class NovelUpdate(BaseModel):
    title: Optional[str] = None
    other_titles: Optional[List[str]] = None
    authors: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    type: Optional[str] = None
    artists: Optional[List[str]] = None
    status: Optional[str] = None
    description: Optional[str] = None
    meta: Optional[Dict[str, Any]] = None
    image_url: Optional[str] = None


class NovelOut(NovelBase):
    id: UUID

    class Config:
        from_attributes = True


class ChapterOut(BaseModel):
    id: UUID
    volume_id: UUID
    title: Optional[str] = None
    order: Optional[int] = None
    meta: Optional[Dict[str, Any]] = None
    last_updated: Optional[datetime] = None

    class Config:
        from_attributes = True


class VolumeOut(BaseModel):
    id: UUID
    novel_id: UUID
    title: Optional[str] = None
    order: Optional[int] = None
    image_url: Optional[str] = None
    meta: Optional[Dict[str, Any]] = None
    last_updated: Optional[datetime] = None
    chapters: List[ChapterOut] = []

    class Config:
        from_attributes = True


class NovelBrief(BaseModel):
    id: UUID
    title: str
    image_url: Optional[str] = None
    authors: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    type: Optional[str] = None
    last_updated: Optional[datetime] = None
    status: Optional[str] = None
    meta: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


class NovelDetail(NovelBase):
    id: UUID
    volumes: List[VolumeOut] = []

    class Config:
        from_attributes = True



