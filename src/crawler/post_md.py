import asyncio
from dotenv import load_dotenv
load_dotenv()
from sqlalchemy.orm import Session
from src.database import SessionLocal

from src.models import Novel
from markdownify import markdownify as md
from bs4 import BeautifulSoup
from tqdm import tqdm


async def convert_descriptions():
    db: Session = SessionLocal()
    try:
        novels = db.query(Novel).filter(
            (Novel.meta["isMarkdown"].astext != "true")  # chưa convert
            | (Novel.meta["isMarkdown"] == None)
        ).all()
        print(f"Found {len(novels)} novels to convert")

        for novel in tqdm(novels, desc="Converting descriptions"):
            if not novel.description:
                continue

            try:
                # Parse HTML để bỏ wrapper div nếu có
                soup = BeautifulSoup(novel.description, "html.parser")
                wrapper = soup.select_one(".summary-content")
                if wrapper:
                    html = wrapper.decode_contents()  # lấy nội dung bên trong
                else:
                    html = str(soup)

                # Convert sang Markdown
                markdown = md(html)

                # Update DB
                novel.description = markdown
                meta = dict(novel.meta or {})
                meta["isMarkdown"] = True
                novel.meta = meta

                db.add(novel)
                db.commit()
            except Exception as e:
                db.rollback()
                print(f"❌ Error converting {novel.title}: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    asyncio.run(convert_descriptions())
