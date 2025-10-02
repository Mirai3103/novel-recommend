import asyncio
import httpx
from bs4 import BeautifulSoup
from sqlalchemy.orm import Session
from src.database import SessionLocal
from src.models import Novel

BASE_URL = "https://docln.sbs{}"


async def fetch_detail(client: httpx.AsyncClient, url: str):
    resp = await client.get(url, timeout=30)
    resp.raise_for_status()
    await asyncio.sleep(1)
    return resp.text


def parse_post_info(html: str):
    soup = BeautifulSoup(html, "html.parser")

    info = {}

    # Lần cuối
    last_time = soup.select_one("#mainpart > div:nth-child(2) > div > div:nth-child(1) > section > main > div.bottom-part > div > div:nth-child(1) > div > div.col-12.col-md-3.statistic-item.block-wide.at-mobile > div.statistic-value > time")
#    <time class="timeago" title="01/10/2025 12:31:51" datetime="2025-10-01T12:31:51+07:00">1 giờ</time>
#  get and parse datetime
    datetime = last_time.get("datetime")
    info["last_update"] = datetime

    # Số từ
    for item in soup.select(".statistic-item"):
        name = item.select_one(".statistic-name")
        val = item.select_one(".statistic-value")
        if not name or not val:
            continue
        label = name.get_text(strip=True)
        if "Số từ" in label:
            info["word_count"] = val.get_text(strip=True).replace(".", "")
        elif "Đánh giá" in label:
            info["rating"] = val.get_text(strip=True).split("/")[0].replace(",", ".")
        elif "Lượt xem" in label:
            info["views"] = val.get_text(strip=True).replace(".", "")
    bookmarkCount = soup.select_one("#collect > span.block.feature-name")
    info["bookmark_count"] = bookmarkCount.get_text(strip=True).replace(".", "")
    # Description giữ HTML
    desc_div = soup.select_one(".summary-content")
    if desc_div:
        info["description_html"] = str(desc_div)

    return info

from tqdm.asyncio import tqdm_asyncio

async def main():
    db: Session = SessionLocal()
    try:
        novels = db.query(Novel).filter(
            (Novel.meta["post_crawler"].astext == "false")
            | (Novel.meta["post_crawler"] == None)
        ).all()
        print(f"Found {len(novels)} novels to update")

        async with httpx.AsyncClient(headers={"User-Agent": "Mozilla/5.0"}) as client:
            for novel in tqdm_asyncio(novels, desc="Crawling post info"):
                url = BASE_URL.format(novel.meta["hako_url"])

                try:
                    html = await fetch_detail(client, url)
                    info = parse_post_info(html)

                    if "description_html" in info:
                        novel.description = info["description_html"]

                    meta = dict(novel.meta or {})
                    meta.update({
                        "last_update": info.get("last_update"),
                        "word_count": info.get("word_count"),
                        "rating": info.get("rating"),
                        "views": info.get("views"),
                        "post_crawler": True,
                        "bookmark_count": info.get("bookmark_count"),
                    })
                    novel.meta = meta

                    db.add(novel)
                    db.commit()
                    print(f"✅ Updated novel: {novel.title}")
                except Exception as e:
                    db.rollback()
                    print(f"❌ Error crawling {novel.title}: {e}")
                    break
    finally:
        db.close()


if __name__ == "__main__":
    asyncio.run(main())
