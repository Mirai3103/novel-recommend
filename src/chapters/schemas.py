from typing import Any, Dict, List, Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, model_validator


class ChapterBase(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1)
    order: Optional[int] = None
    meta: Optional[Dict[str, Any]] = None
    content: Optional[str] = None
    last_updated: Optional[datetime] = None


class ChapterCreate(ChapterBase):
    volume_id: UUID
    title: str = Field(..., min_length=1)


class ChapterUpdate(BaseModel):
    title: Optional[str] = None
    order: Optional[int] = None
    meta: Optional[Dict[str, Any]] = None
    content: Optional[str] = None


class ChapterOut(ChapterBase):
    id: UUID
    volume_id: UUID

    class Config:
        from_attributes = True


class VolumeBrief(BaseModel):
    id: UUID
    novel_id: UUID
    title: Optional[str] = None
    order: Optional[int] = None
    image_url: Optional[str] = None
    meta: Optional[Dict[str, Any]] = None
    last_updated: Optional[datetime] = None

    class Config:
        from_attributes = True


class NovelInfo(BaseModel):
    id: UUID
    title: str
    authors: Optional[List[str]] = None
    artists: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    image_url: Optional[str] = None

    class Config:
        from_attributes = True


class ChapterDetail(ChapterOut):
    content: Optional[str] = None
    volume: VolumeBrief
    novel: NovelInfo

    @model_validator(mode="before")
    def extract_novel(cls, values):
        # Nếu input là SQLAlchemy object
        if hasattr(values, "volume") and values.volume is not None:
            values.novel = values.volume.novel
        # Nếu input là dict
        elif isinstance(values, dict) and "volume" in values and values["volume"]:
            values["novel"] = values["volume"].novel
        return values

