from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from starlette.concurrency import run_in_threadpool

from src.bookmarks.schemas import BookmarkCreate, BookmarkDetail, BookmarkOut, BookmarkUpdate
from src.bookmarks.dependencies import db_dep
from src.bookmarks.constants import DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE
from src.bookmarks.service import (
    create_bookmark,
    delete_bookmark,
    delete_bookmark_by_novel,
    get_bookmark,
    list_bookmarks,
    update_bookmark,
)
from src.bookmarks.utils import paginate_params
from src.bookmarks.exceptions import BookmarkAlreadyExistsError
from src.users.dependencies import CurrentUser


router = APIRouter(prefix="/bookmarks", tags=["bookmarks"])


@router.post(
    "",
    response_model=BookmarkOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create bookmark",
    description="Create a new bookmark for the current user.",
)
async def create_bookmark_endpoint(
    data: BookmarkCreate,
    current_user: CurrentUser,
    db: Session = Depends(db_dep)
) -> BookmarkOut:
    try:
        bookmark = await run_in_threadpool(create_bookmark, db, current_user.id, data)
        return BookmarkOut.model_validate(bookmark)
    except BookmarkAlreadyExistsError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )


@router.get(
    "",
    response_model=List[BookmarkDetail],
    status_code=status.HTTP_200_OK,
    summary="List bookmarks",
    description="List all bookmarks for the current user.",
)
async def list_bookmarks_endpoint(
    current_user: CurrentUser,
    bookmark_type: Optional[str] = Query(default=None, regex="^(novel|chapter)$"),
    skip: int | None = Query(default=0, ge=0),
    limit: int | None = Query(default=DEFAULT_PAGE_SIZE, ge=1, le=MAX_PAGE_SIZE),
    db: Session = Depends(db_dep),
) -> List[BookmarkDetail]:
    s, l = paginate_params(skip, limit, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE)
    bookmarks = await run_in_threadpool(
        list_bookmarks, db, current_user.id, s, l, bookmark_type
    )
    return [BookmarkDetail.model_validate(b) for b in bookmarks]


@router.get(
    "/{bookmark_id}",
    response_model=BookmarkDetail,
    status_code=status.HTTP_200_OK,
    summary="Get bookmark",
    description="Get a bookmark by ID.",
)
async def get_bookmark_endpoint(
    bookmark_id: UUID,
    current_user: CurrentUser,
    db: Session = Depends(db_dep)
) -> BookmarkDetail:
    bookmark = await run_in_threadpool(get_bookmark, db, bookmark_id, current_user.id)
    if not bookmark:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bookmark not found"
        )
    return BookmarkDetail.model_validate(bookmark)


@router.patch(
    "/{bookmark_id}",
    response_model=BookmarkOut,
    status_code=status.HTTP_200_OK,
    summary="Update bookmark",
    description="Update bookmark chapter and line position.",
)
async def update_bookmark_endpoint(
    bookmark_id: UUID,
    data: BookmarkUpdate,
    current_user: CurrentUser,
    db: Session = Depends(db_dep)
) -> BookmarkOut:
    bookmark = await run_in_threadpool(
        update_bookmark, db, bookmark_id, current_user.id, data
    )
    if not bookmark:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bookmark not found"
        )
    return BookmarkOut.model_validate(bookmark)


@router.delete(
    "/{bookmark_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete bookmark",
    description="Delete a bookmark by ID.",
)
async def delete_bookmark_endpoint(
    bookmark_id: UUID,
    current_user: CurrentUser,
    db: Session = Depends(db_dep)
) -> None:
    ok = await run_in_threadpool(delete_bookmark, db, bookmark_id, current_user.id)
    if not ok:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bookmark not found"
        )
    return None


@router.delete(
    "/novel/{novel_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete bookmarks by novel",
    description="Delete all bookmarks for a specific novel.",
)
async def delete_bookmarks_by_novel_endpoint(
    novel_id: UUID,
    current_user: CurrentUser,
    db: Session = Depends(db_dep)
) -> None:
    ok = await run_in_threadpool(delete_bookmark_by_novel, db, current_user.id, novel_id)
    if not ok:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No bookmarks found for this novel"
        )
    return None

