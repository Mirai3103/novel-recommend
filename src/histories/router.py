from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from starlette.concurrency import run_in_threadpool

from src.histories.schemas import HistoryCreate, HistoryDetail, HistoryOut
from src.histories.dependencies import db_dep
from src.histories.constants import DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE
from src.histories.service import (
    create_history,
    delete_all_history,
    delete_history,
    delete_history_by_novel,
    get_history,
    get_last_read_chapter,
    list_histories,
)
from src.histories.utils import paginate_params
from src.users.dependencies import CurrentUser


router = APIRouter(prefix="/histories", tags=["histories"])


@router.post(
    "",
    response_model=HistoryOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create history",
    description="Create or update reading history for the current user.",
)
async def create_history_endpoint(
    data: HistoryCreate,
    current_user: CurrentUser,
    db: Session = Depends(db_dep)
) -> HistoryOut:
    history = await run_in_threadpool(create_history, db, current_user.id, data)
    return HistoryOut.model_validate(history)


@router.get(
    "",
    response_model=List[HistoryDetail],
    status_code=status.HTTP_200_OK,
    summary="List histories",
    description="List reading history for the current user.",
)
async def list_histories_endpoint(
    current_user: CurrentUser,
    novel_id: Optional[UUID] = Query(default=None),
    skip: int | None = Query(default=0, ge=0),
    limit: int | None = Query(default=DEFAULT_PAGE_SIZE, ge=1, le=MAX_PAGE_SIZE),
    db: Session = Depends(db_dep),
) -> List[HistoryDetail]:
    s, l = paginate_params(skip, limit, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE)
    histories = await run_in_threadpool(
        list_histories, db, current_user.id, s, l, novel_id
    )
    return [HistoryDetail.model_validate(h) for h in histories]


@router.get(
    "/last-read/{novel_id}",
    response_model=HistoryDetail,
    status_code=status.HTTP_200_OK,
    summary="Get last read chapter",
    description="Get the last chapter read for a specific novel.",
)
async def get_last_read_chapter_endpoint(
    novel_id: UUID,
    current_user: CurrentUser,
    db: Session = Depends(db_dep)
) -> HistoryDetail:
    history = await run_in_threadpool(get_last_read_chapter, db, current_user.id, novel_id)
    if not history:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No reading history found for this novel"
        )
    return HistoryDetail.model_validate(history)


@router.get(
    "/{history_id}",
    response_model=HistoryDetail,
    status_code=status.HTTP_200_OK,
    summary="Get history",
    description="Get a history entry by ID.",
)
async def get_history_endpoint(
    history_id: UUID,
    current_user: CurrentUser,
    db: Session = Depends(db_dep)
) -> HistoryDetail:
    history = await run_in_threadpool(get_history, db, history_id, current_user.id)
    if not history:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="History not found"
        )
    return HistoryDetail.model_validate(history)


@router.delete(
    "/{history_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete history",
    description="Delete a history entry by ID.",
)
async def delete_history_endpoint(
    history_id: UUID,
    current_user: CurrentUser,
    db: Session = Depends(db_dep)
) -> None:
    ok = await run_in_threadpool(delete_history, db, history_id, current_user.id)
    if not ok:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="History not found"
        )
    return None


@router.delete(
    "",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete all history",
    description="Delete all reading history for the current user.",
)
async def delete_all_history_endpoint(
    current_user: CurrentUser,
    db: Session = Depends(db_dep)
) -> None:
    ok = await run_in_threadpool(delete_all_history, db, current_user.id)
    if not ok:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No history found"
        )
    return None


@router.delete(
    "/novel/{novel_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete history by novel",
    description="Delete all history entries for a specific novel.",
)
async def delete_history_by_novel_endpoint(
    novel_id: UUID,
    current_user: CurrentUser,
    db: Session = Depends(db_dep)
) -> None:
    ok = await run_in_threadpool(delete_history_by_novel, db, current_user.id, novel_id)
    if not ok:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No history found for this novel"
        )
    return None

