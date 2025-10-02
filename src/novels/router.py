from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from starlette.concurrency import run_in_threadpool

from src.novels.schemas import NovelBrief, NovelCreate, NovelDetail, NovelOut, NovelUpdate
from src.novels.dependencies import db_dep
from src.novels.constants import DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE
from src.novels.service import (
    create_novel,
    delete_novel,
    get_novel,
    get_novel_detail,
    get_novel_by_title,
    list_novels,
    update_novel,
)
from src.novels.utils import paginate_params


router = APIRouter(prefix="/novels", tags=["novels"])


@router.post(
    "",
    response_model=NovelOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create a novel",
    description="Create a new novel record.",
)
async def create_novel_endpoint(data: NovelCreate, db: Session = Depends(db_dep)) -> NovelOut:
    existing = await run_in_threadpool(get_novel_by_title, db, data.title)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Novel title already exists")
    novel = await run_in_threadpool(create_novel, db, data)
    return NovelOut.model_validate(novel)


@router.get(
    "",
    response_model=List[NovelBrief],
    status_code=status.HTTP_200_OK,
    summary="List novels",
    description="List novels with pagination.",
)
async def list_novels_endpoint(
    skip: int | None = Query(default=0, ge=0),
    limit: int | None = Query(default=DEFAULT_PAGE_SIZE, ge=1, le=MAX_PAGE_SIZE),
    keyword: str | None = Query(default=None, description="Search in title and other_titles"),
    status_in: List[str] | None = Query(default=None, description="Filter by statuses; repeat to pass multiple"),
    sort_by: str = Query(default="last_updated", regex="^(status|title|last_updated)$"),
    sort_dir: str = Query(default="desc", regex="^(asc|desc)$"),
    db: Session = Depends(db_dep),
) -> List[NovelBrief]:
    s, l = paginate_params(skip, limit, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE)
    novels = await run_in_threadpool(
        list_novels,
        db,
        s,
        l,
        keyword,
        status_in,
        sort_by,
        sort_dir,
    )
    return [NovelBrief.model_validate(n) for n in novels]


@router.get(
    "/{novel_id}",
    response_model=NovelDetail,
    status_code=status.HTTP_200_OK,
    summary="Get novel by id",
    description="Retrieve a novel by its ID with volumes and chapters.",
)
async def get_novel_endpoint(novel_id: UUID, db: Session = Depends(db_dep)) -> NovelDetail:
    novel = await run_in_threadpool(get_novel_detail, db, novel_id)
    if not novel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Novel not found")
    return NovelDetail.model_validate(novel)


@router.patch(
    "/{novel_id}",
    response_model=NovelOut,
    status_code=status.HTTP_200_OK,
    summary="Update novel",
    description="Partially update a novel by ID.",
)
async def update_novel_endpoint(novel_id: UUID, data: NovelUpdate, db: Session = Depends(db_dep)) -> NovelOut:
    updated = await run_in_threadpool(update_novel, db, novel_id, data)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Novel not found")
    return NovelOut.model_validate(updated)


@router.delete(
    "/{novel_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete novel",
    description="Delete a novel by ID.",
)
async def delete_novel_endpoint(novel_id: UUID, db: Session = Depends(db_dep)) -> None:
    ok = await run_in_threadpool(delete_novel, db, novel_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Novel not found")
    return None


