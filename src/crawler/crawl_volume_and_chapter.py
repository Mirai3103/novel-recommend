import asyncio
import httpx
import uuid
from bs4 import BeautifulSoup
from sqlalchemy.orm import Session
from src.database import SessionLocal
from src.models import Novel, Volume, Chapter
from tqdm.asyncio import tqdm_asyncio

BASE_URL = "https://docln.sbs{}"


async def fetch_detail(client: httpx.AsyncClient, url: str):
    resp = await client.get(url, timeout=30)
    resp.raise_for_status()
    await asyncio.sleep(1)  # throttle
    return resp.text


def parse_volumes_and_chapters(html: str, novel: Novel):
    soup = BeautifulSoup(html, "html.parser")
    volumes, chapters = [], []

    # Lấy cover novel
    cover_tag = soup.select_one(".section-body .content.img-in-ratio")
    if cover_tag and cover_tag.get("style"):
        novel.image_url = cover_tag["style"].split("url(")[-1].strip(") '\"")

    # Lấy volumes
    volume_blocks = soup.select("section.volume-list")
    for vol_index, vol in enumerate(volume_blocks, start=1):
        vol_title_tag = vol.select_one(".sect-title")
        vol_title = vol_title_tag.get_text(strip=True) if vol_title_tag else f"Volume {vol_index}"

        img_tag = vol.select_one(".volume-cover .content.img-in-ratio")
        image_url = img_tag["style"].split("url(")[-1].strip(") '\"") if img_tag else None

        volume_id = uuid.uuid4()
        volumes.append(
            Volume(
                id=volume_id,
                novel_id=novel.id,
                title=vol_title,
                order=vol_index,
                image_url=image_url,
                meta={},
            )
        )

        # Chapters trong volume
        chap_tags = vol.select(".list-chapters.at-series li a")
        for chap_index, a in enumerate(chap_tags, start=1):
            chap_title = a.get_text(strip=True)
            chap_url = a["href"]

            chapters.append(
                Chapter(
                    id=uuid.uuid4(),
                    volume_id=volume_id,
                    title=chap_title,
                    order=chap_index,
                    meta={"hako_url": chap_url},
                    content=None,
                )
            )

    return volumes, chapters


async def main():
    db: Session = SessionLocal()
    try:
        novels = db.query(Novel).filter(
            (Novel.meta["is_crawled_volume"].astext == "false") |
            (Novel.meta["is_crawled_volume"] == None)
        ).all()

        async with httpx.AsyncClient(headers={"User-Agent": "Mozilla/5.0"}) as client:
            for novel in tqdm_asyncio(novels, desc="Crawling volumes/chapters"):
                url = BASE_URL.format(novel.meta["hako_url"])

                try:
                    html = await fetch_detail(client, url)
                    volumes, chapters = parse_volumes_and_chapters(html, novel)
                    
                    for v in volumes:
                        db.add(v)
                    for c in chapters:
                        db.add(c)

                    # update novel meta
                    meta = dict(novel.meta) if novel.meta else {}
                    meta["is_crawled_volume"] = True
                    novel.meta = meta

                    db.add(novel)
                    db.commit()
                except Exception as e:
                    db.rollback()
                    print(f"❌ Error crawling {novel.title}: {e}")

    finally:
        db.close()


if __name__ == "__main__":
    asyncio.run(main())
