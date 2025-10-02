import asyncio
import httpx
from bs4 import BeautifulSoup
from sqlalchemy.orm import Session
from src.database import SessionLocal
from src.models import Novel
from tqdm.asyncio import tqdm_asyncio
BASE_URL = "https://docln.sbs{}"  # meta.hako_url là dạng "/truyen/xxxx"

async def fetch_detail(client: httpx.AsyncClient, url: str,sem: asyncio.Semaphore = None):
    if sem:
        async with sem:
            resp = await client.get(url, timeout=30)
            resp.raise_for_status()
            return resp.text
    resp = await client.get(url, timeout=30)
    resp.raise_for_status()
    return resp.text

def parse_detail(html: str):
    soup = BeautifulSoup(html, "html.parser")

    # Description
    desc_tag = soup.select_one(".summary-content")
    description = desc_tag.get_text(strip=True) if desc_tag else None

    # Status, type
    status = None
    type_ = soup.select_one(".series-type")
    type_ = type_.get_text(strip=True) if type_ else None
    for row in soup.select(".info-item"):
        label = row.select_one(".info-name")
        value = row.select_one(".info-value")
        if not label or not value:
            continue
        label_text = label.get_text(strip=True).lower()
        value_text = value.get_text(strip=True)
        if "tình trạng" in label_text:
            status = value_text

    # Authors, artists, tags
    authors = [a.get_text(strip=True) for a in soup.select("a[href*='tac-gia']")]
    artists = [a.get_text(strip=True) for a in soup.select("a[href*='hoa-si']")]
    tags = [a.get_text(strip=True) for a in soup.select("a[href*='the-loai']")]

    # Other titles
# Other titles
    other_titles = []
    fact_item = soup.find("div", class_="fact-item")
    if fact_item and "Tên khác" in fact_item.get_text():
        other_titles = [div.get_text(strip=True) for div in fact_item.select(".fact-value .block")]


    return {
        "tags": tags,
        "authors": authors,
        "artists": artists,
        "status": status,
        "description": description,
        "other_titles": other_titles,
        "type": type_,
    }

async def main():
    db: Session = SessionLocal()
    sem = asyncio.Semaphore(5)  # chỉ cho phép 2 request song song
    try:
        novels = db.query(Novel).filter(
            (Novel.meta["is_crawled_detail"].astext == "false") |
            (Novel.meta["is_crawled_detail"] == None)
        ).all()

        async with httpx.AsyncClient(headers={"User-Agent": "Mozilla/5.0"}) as client:
            for novel in tqdm_asyncio(novels, desc="Crawling details"):
                await asyncio.sleep(1)  # throttle nhẹ
                if novel.status:
                    meta = dict(novel.meta or {})   # tạo dict mới hoàn toàn
                    meta["is_crawled_detail"] = True
                    novel.meta = meta 
                    db.add(novel)
                    db.commit()
                    continue    
                url = BASE_URL.format(novel.meta["hako_url"])
                try:
                    html = await fetch_detail(client, url, sem)
                    detail = parse_detail(html)

                    # Update novel
                    novel.tags = detail["tags"]
                    novel.authors = detail["authors"]
                    novel.artists = detail["artists"]
                    novel.status = detail["status"]
                    novel.description = detail["description"]
                    novel.other_titles = detail["other_titles"]
                    novel.type = detail["type"]

                    # Cập nhật flag
                    meta = dict(novel.meta or {})   # tạo dict mới hoàn toàn
                    meta["is_crawled_detail"] = True
                    novel.meta = meta 
                    db.add(novel)
                    db.commit()
                except Exception as e:
                    print(f"❌ Error crawling {novel.title}: {e}")
                    db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(main())
