from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from starlette.concurrency import run_in_threadpool

from src.chapters.schemas import ChapterCreate, ChapterDetail, ChapterOut, ChapterUpdate
from src.chapters.dependencies import db_dep
from src.chapters.constants import DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE
from src.chapters.service import (
    create_chapter,
    delete_chapter,
    get_chapter,
    list_chapters,
    update_chapter,
)
from src.chapters.utils import paginate_params


router = APIRouter(prefix="/chapters", tags=["chapters"])


@router.post(
    "",
    response_model=ChapterOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create chapter",
    description="Create a new chapter",
)
async def create_chapter_endpoint(data: ChapterCreate, db: Session = Depends(db_dep)) -> ChapterOut:
    chapter = await run_in_threadpool(create_chapter, db, data)
    return ChapterOut.model_validate(chapter)


@router.get(
    "",
    response_model=List[ChapterOut],
    status_code=status.HTTP_200_OK,
    summary="List chapters",
    description="List chapters with optional filter by volume_id.",
)
async def list_chapters_endpoint(
    volume_id: Optional[UUID] = Query(default=None),
    skip: int | None = Query(default=0, ge=0),
    limit: int | None = Query(default=DEFAULT_PAGE_SIZE, ge=1, le=MAX_PAGE_SIZE),
    sort_by: str = Query(default="order", regex="^(order|last_updated)$"),
    sort_dir: str = Query(default="asc", regex="^(asc|desc)$"),
    db: Session = Depends(db_dep),
) -> List[ChapterOut]:
    s, l = paginate_params(skip, limit, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE)
    chapters = await run_in_threadpool(list_chapters, db, volume_id, s, l, sort_by, sort_dir)
    return [ChapterOut.model_validate(c) for c in chapters]


@router.get(
    "/{chapter_id}",
    response_model=ChapterDetail,
    status_code=status.HTTP_200_OK,
    summary="Get chapter",
    description="Get a chapter by id",
)
async def get_chapter_endpoint(chapter_id: UUID, db: Session = Depends(db_dep)) -> ChapterDetail:
    chapter = await run_in_threadpool(get_chapter, db, chapter_id)
    if not chapter:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chapter not found")
    return ChapterDetail.model_validate(chapter)


@router.patch(
    "/{chapter_id}",
    response_model=ChapterOut,
    status_code=status.HTTP_200_OK,
    summary="Update chapter",
    description="Partially update a chapter",
)
async def update_chapter_endpoint(
    chapter_id: UUID, data: ChapterUpdate, db: Session = Depends(db_dep)
) -> ChapterOut:
    chapter = await run_in_threadpool(update_chapter, db, chapter_id, data)
    if not chapter:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chapter not found")
    return ChapterOut.model_validate(chapter)


@router.delete(
    "/{chapter_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete chapter",
    description="Delete a chapter by id",
)
async def delete_chapter_endpoint(chapter_id: UUID, db: Session = Depends(db_dep)) -> None:
    ok = await run_in_threadpool(delete_chapter, db, chapter_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chapter not found")
    return None


