import asyncio
from dotenv import load_dotenv
load_dotenv()
from sqlalchemy import select
from src.database import AsyncSessionLocal
from src.models import Novel
from tqdm import tqdm


async def aggregate():
    async with AsyncSessionLocal() as db:
        try:
            # 🧩 Query các novel chưa aggregate
            stmt = select(Novel).filter(
                (Novel.meta["isAgrred"].astext != "true")
                | (Novel.meta["isAgrred"] == None)
            )
            result = await db.execute(stmt)
            novels = result.scalars().all()

            print(f"Found {len(novels)} novels to convert")

            for novel in tqdm(novels, desc="Aggregating meta data"):
                try:
                    meta = dict(novel.meta or {})

                    # 🔢 convert field trong meta sang int/float
                    novel.total_views = int(meta.get("views", 0) or 0)
                    novel.total_favorites = int(meta.get("bookmark_count", 0) or 0)
                    novel.total_ratings = 0
                    novel.average_rating = float(meta.get("rating", 0) or 0)
                    novel.last_updated = meta.get("last_update")

                    # ✅ đánh dấu đã xử lý
                    meta["isAgrred"] = True
                    novel.meta = meta

                    db.add(novel)

                except Exception as e:
                    await db.rollback()
                    print(f"❌ Error converting {novel.title}: {e}")

            await db.commit()
            print("✅ Aggregation completed!")

        finally:
            await db.close()


if __name__ == "__main__":
    asyncio.run(aggregate())
