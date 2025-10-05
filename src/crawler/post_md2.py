import asyncio
from dotenv import load_dotenv
load_dotenv()
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select
from src.database import AsyncSessionLocal
from src.models import Chapter
from markdownify import markdownify as md
from bs4 import BeautifulSoup
from tqdm import tqdm

BATCH_SIZE = 500  # mỗi lần xử lý 500 chapters


def convert_html_to_markdown(html: str) -> str:
    if not html:
        return ""
    soup = BeautifulSoup(html, "html.parser")
    wrapper = soup.select_one("#chapter-content")
    if wrapper:
        html = wrapper.decode_contents()
    else:
        html = str(soup)
    return md(html)


async def main():
    async with AsyncSessionLocal() as db:
        # --- Đếm tổng số ---
        stmt_total = select(func.count(Chapter.id)).filter(
            (Chapter.meta["isMarkdown"].astext != "true")
            | (Chapter.meta["isMarkdown"] == None)
        )
        result = await db.execute(stmt_total)
        total = result.scalar()
        print(f"Found {total} chapters to convert")

        offset = 0
        with tqdm(total=total, desc="Converting chapters") as pbar:
            while offset < total:
                stmt_chapters = (
                    select(Chapter)
                    .filter(
                        (Chapter.meta["isMarkdown"].astext != "true")
                        | (Chapter.meta["isMarkdown"] == None)
                    )
                    .order_by(Chapter.id)
                    .offset(offset)
                    .limit(BATCH_SIZE)
                )

                result = await db.execute(stmt_chapters)
                chapters = result.scalars().all()

                if not chapters:
                    break

                for chap in chapters:
                    try:
                        markdown = convert_html_to_markdown(chap.content)
                        chap.content = markdown

                        meta = dict(chap.meta or {})
                        meta["isMarkdown"] = True
                        chap.meta = meta

                        db.add(chap)
                    except Exception as e:
                        print(f"❌ Error converting chapter {chap.id}: {e}")
                        await db.rollback()
                        continue

                await db.commit()
                offset += BATCH_SIZE
                pbar.update(len(chapters))

        print("✅ Conversion completed!")


if __name__ == "__main__":
    asyncio.run(main())
