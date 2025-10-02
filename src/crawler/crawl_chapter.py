import asyncio
import time
import httpx
import random
from bs4 import BeautifulSoup
from sqlalchemy.orm import Session
from src.database import SessionLocal
from src.models import Chapter
import json
from tqdm.asyncio import tqdm_asyncio


BASE_URL = "https://docln.sbs{}"

# Danh sách proxy
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


def get_random_proxy():
    """Chọn ngẫu nhiên một proxy từ danh sách"""
    proxy_str = random.choice(PROXIES)
    ip_port, username, password = proxy_str.rsplit(':', 2)
    proxy_url = f"http://{username}:{password}@{ip_port}"
    return proxy_url


async def fetch_chapter(client: httpx.AsyncClient, url: str, sem: asyncio.Semaphore, max_retries=3):
    """Fetch chapter với retry logic và proxy rotation"""
    async with sem:
        for attempt in range(max_retries):
            try:
                resp = await client.get(url, timeout=30)
                resp.raise_for_status()
                # await asyncio.sleep(1)  # throttle
                return resp.text
            except (httpx.HTTPStatusError, httpx.ProxyError, httpx.ConnectError) as e:
                if attempt < max_retries - 1:
                    print(f"⚠️  Proxy error (attempt {attempt + 1}/{max_retries}): {e}")
                    await asyncio.sleep(2)  # Đợi trước khi retry
                else:
                    raise


def parse_chapter_content(html: str):
    soup = BeautifulSoup(html, "html.parser")

    # Title
    title_tag = soup.select_one(".title-top h4")
    title = title_tag.get_text(strip=True) if title_tag else None

    # Nội dung
    content_div = soup.select_one("#chapter-content")
    content_html = str(content_div) if content_div else None

    return title, content_html


isDone = False

async def main():
    db: Session = SessionLocal()
    sem = asyncio.Semaphore(10)  # max 5 concurrent fetches
    
    try:
        chapters = db.query(Chapter).filter(
            (Chapter.meta["is_crawled_content"].astext == "false")
            | (Chapter.meta["is_crawled_content"] == None)
        ).all()

        print(f"Found {len(chapters)} chapters to crawl")

        for chap in tqdm_asyncio(chapters, desc="Crawling chapters"):
            # Chọn proxy ngẫu nhiên cho mỗi request
            proxy_url = get_random_proxy()
            
            async with httpx.AsyncClient(
                headers={"User-Agent": "Mozilla/5.0"},
                proxy=proxy_url
            ) as client:
                await asyncio.sleep(1)
                url = BASE_URL.format(chap.meta["hako_url"])

                try:
                    html = await fetch_chapter(client, url, sem)
                    new_title, content_html = parse_chapter_content(html)

                    # if new_title:
                    #     chap.title = new_title
                    chap.content = content_html

                    meta = dict(chap.meta) or {}
                    meta["is_crawled_content"] = True
                    chap.meta = meta

                    db.add(chap)
                    db.commit()
                    
                except httpx.HTTPStatusError as e:
                    if e.response.status_code == 429:
                        print("❌ Too Many Requests. Switching proxy and continuing...")
                        db.rollback()
                        await asyncio.sleep(5)  # Đợi 5s trước khi thử proxy khác
                        continue
                    else:
                        db.rollback()
                        print(f"❌ HTTP error: {e}")
                except Exception as e:
                    db.rollback()
                    print(f"❌ Error crawling chapter {chap.title}: {e}")
                    continue  # Tiếp tục với chapter tiếp theo thay vì break
                    
    finally:
        db.close()
        global isDone
        isDone = True


if __name__ == "__main__":
    while True:
        try:
            asyncio.run(main())
        except Exception as e:
            print(f"❌ Script crashed: {e}")
        
        if isDone:
            print("✅ Crawling completed!")
            break
            
        print("⏳ Restarting in 5 minutes...")
        time.sleep(300)  # 5 phút