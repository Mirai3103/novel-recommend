import asyncio
import httpx
import json
import os
import uuid
from bs4 import BeautifulSoup
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session
from src.database import SessionLocal
from src.models import Novel

BASE_URL = (
    "https://docln.sbs/danh-sach?"
    "truyendich=1&dangtienhanh=1&tamngung=1&hoanthanh=1&sapxep=top&page={}"
)

PAGES_FILE = "pending_pages.json"


async def fetch_page(client: httpx.AsyncClient, page: int, sem: asyncio.Semaphore):
    url = BASE_URL.format(page)
    async with sem:
        try:
            resp = await client.get(url, timeout=30)
            resp.raise_for_status()
            await asyncio.sleep(1)  # throttle nhẹ
            return page, resp.text
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 429:
                print(f"⚠️ Too many requests at page {page}")
                raise
            raise


def parse_novels(html: str):
    soup = BeautifulSoup(html, "html.parser")
    results = []
    for item in soup.select(".thumb-item-flow"):
        title_tag = item.select_one(".series-title a")
        if not title_tag:
            continue
        title = title_tag.text.strip()
        hako_url = title_tag["href"]
        results.append((title, hako_url))
    return results


def insert_to_db(novels):
    """Insert novels vào DB với on_conflict_do_nothing."""
    db: Session = SessionLocal()
    try:
        for title, url in novels:
            stmt = insert(Novel).values(
                id=uuid.uuid4(),
                title=title,
                meta={"hako_url": url},
            ).on_conflict_do_nothing(index_elements=["title"])
            db.execute(stmt)
            print(f"Inserted (skip if exists): {title}")
        db.commit()
    finally:
        db.close()


async def main():
    # Nếu có file pending → load tiếp, ngược lại crawl từ đầu
    if os.path.exists(PAGES_FILE):
        with open(PAGES_FILE, "r") as f:
            pending_pages = json.load(f)
    else:
        pending_pages = list(range(1, 90))  # crawl từ 1-89

    results = []
    sem = asyncio.Semaphore(2)  # chỉ cho phép 2 request song song
    async with httpx.AsyncClient(headers={"User-Agent": "Mozilla/5.0"}) as client:
        try:
            tasks = [fetch_page(client, p, sem) for p in pending_pages]
            for coro in asyncio.as_completed(tasks):
                page, html = await coro
                results.extend(parse_novels(html))
                pending_pages.remove(page)  # gỡ page đã xong
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 429:
                print("⚠️ Rate limited, saving progress and stopping...")
                insert_to_db(results)
                with open(PAGES_FILE, "w") as f:
                    json.dump(pending_pages, f)
                return
            else:
                raise

    # nếu crawl xong hết → insert và xóa file pending
    insert_to_db(results)
    if os.path.exists(PAGES_FILE):
        os.remove(PAGES_FILE)
    print("✅ Done!")


if __name__ == "__main__":
    asyncio.run(main())
