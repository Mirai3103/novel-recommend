import asyncio
import time
import httpx
import random
from dotenv import load_dotenv
load_dotenv()
from bs4 import BeautifulSoup
from sqlalchemy import select, update
from src.database import AsyncSessionLocal
from src.models import Chapter
from tqdm.asyncio import tqdm_asyncio
from datetime import datetime
from collections import deque


BASE_URL = "https://docln.sbs{}"

PROXIES = [
    "199.7.142.57:25946:wqVnhE:qTFcqS",
    "200.229.24.140:31781:wqVnhE:qTFcqS",
    "206.125.175.160:49127:wqVnhE:qTFcqS",
    "180.149.35.241:22229:wqVnhE:qTFcqS",
    "172.111.171.224:26147:wqVnhE:qTFcqS",
    "180.149.35.236:45436:wqVnhE:qTFcqS",
    "172.111.171.79:12108:wqVnhE:qTFcqS",
    "172.111.171.30:41781:wqVnhE:qTFcqS",
    "166.0.152.236:36140:wqVnhE:qTFcqS",
    "172.111.171.38:41425:wqVnhE:qTFcqS",
    "180.149.35.24:24839:wqVnhE:qTFcqS",
    "172.111.171.215:31192:wqVnhE:qTFcqS",
    "166.0.152.200:33211:wqVnhE:qTFcqS",
    "206.125.175.243:26841:wqVnhE:qTFcqS"
]

proxy_pool = deque(PROXIES)

def get_next_proxy() -> str:
    """Round-robin proxy để phân tải đều"""
    proxy_str = proxy_pool[0]
    proxy_pool.rotate(-1)
    ip_port, username, password = proxy_str.rsplit(':', 2)
    return f"http://{username}:{password}@{ip_port}"

notfoundErrors=[]
async def fetch_chapter(url: str, sem: asyncio.Semaphore, max_retries=3):
    """Fetch chapter với retry và proxy rotation"""
    async with sem:
        for attempt in range(max_retries):
            proxy_url = get_next_proxy()
            try:
                async with httpx.AsyncClient(
                    headers={"User-Agent": "Mozilla/5.0"},
                    proxy=proxy_url,
                    timeout=30
                ) as client:
                    resp = await client.get(url)
                    status_code = resp.status_code
                    if status_code == 404:
                        notfoundErrors.append(url)
                    resp.raise_for_status()
                    return resp.text
            except Exception as e:
                if attempt < max_retries - 1:
                    await asyncio.sleep(random.uniform(1, 3))
        return None


def parse_chapter_content(html: str):
    """Trích xuất nội dung chương"""
    soup = BeautifulSoup(html, "html.parser")
    time_tag = soup.select_one("time.topic-time")
    last_time = time_tag.get("datetime") if time_tag else None
    return last_time


async def crawl_and_update(chap_id, hako_url, sem):
    """Crawl 1 chương và update DB với session riêng"""
    url = BASE_URL.format(hako_url)
    html = await fetch_chapter(url, sem)
    
    if not html:
        return {"id": chap_id, "success": False, "error": "fetch_failed"}

    last_time = parse_chapter_content(html)
    if not last_time:
        return {"id": chap_id, "success": False, "error": "parse_failed"}

    # Tạo session riêng cho task này
    try:
        async with AsyncSessionLocal() as db:
            stmt = (
                update(Chapter)
                .where(Chapter.id == chap_id)
                .values(
                    last_updated=datetime.fromisoformat(last_time),
                    meta={"is_crawledTime": True, "hako_url": hako_url},
                )
            )
            await db.execute(stmt)
            await db.commit()
        return {"id": chap_id, "success": True}
    except Exception as e:
        return {"id": chap_id, "success": False, "error": str(e)}


async def main():
    sem = asyncio.Semaphore(10)  # Giảm concurrency vì mỗi task tạo session riêng
    BATCH_SIZE = 200
    
    failed_ids = []
    total_success = 0
    total_failed = 0

    # Session chỉ dùng để query, không dùng để update
    async with AsyncSessionLocal() as db:
        while True:
            stmt = (
                select(Chapter.id, Chapter.meta)
                .filter(
                    (Chapter.meta["is_crawledTime"].astext == "false")
                    | (Chapter.meta["is_crawledTime"] == None)
                )
                .order_by(Chapter.id)
                .limit(BATCH_SIZE)
            )
            result = await db.execute(stmt)
            rows = result.all()

            if not rows:
                break

            # Tạo tasks - mỗi task tự tạo session riêng
            tasks = []
            for row in rows:
                hako_url = row.meta.get("hako_url")
                if not hako_url:
                    continue
                tasks.append(crawl_and_update(row.id, hako_url, sem))

            # Process với progress bar
            for coro in tqdm_asyncio.as_completed(
                tasks, 
                desc=f"📥 Crawling (✅{total_success} ❌{total_failed})"
            ):
                result = await coro
                
                if result["success"]:
                    total_success += 1
                else:
                    total_failed += 1
                    failed_ids.append(result["id"])
            
            # Delay nhẹ giữa các batch
            await asyncio.sleep(1)

        print(f"\n✅ Success: {total_success}")
        print(f"❌ Failed: {total_failed}")
        if failed_ids:
            print(f"Failed IDs (first 100): {failed_ids[:100]}")


if __name__ == "__main__":
    retry_count = 0
    max_retries = 3
    
    while retry_count < max_retries:
        try:
            asyncio.run(main())
            print("✅ Crawling completed!")
            break
        except Exception as e:
            retry_count += 1
            print(f"❌ Script crashed (attempt {retry_count}/{max_retries}): {e}")
            if retry_count < max_retries:
                print("⏳ Restarting in 30 seconds...")
                time.sleep(30)
            else:
                print("❌ Max retries reached. Exiting.")
                raise