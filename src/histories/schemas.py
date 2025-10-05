from typing import Any, Dict, List, Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field





class HistoryBase(BaseModel):
    novel_id: UUID
    chapter_id: UUID



class HistoryCreate(HistoryBase):
    pass



class HistoryOut(HistoryBase):
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



class HistoryDetail(HistoryOut):
    novel: NovelBrief
    chapter: ChapterBrief

    class Config:
        from_attributes = True

