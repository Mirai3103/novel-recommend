from fastapi import FastAPI
import uvicorn
from src.novels.router import router as novels_router
from src.chapters.router import router as chapters_router
from src.users.router import router as users_router
from src.bookmarks.router import router as bookmarks_router
from src.histories.router import router as histories_router


def create_app() -> FastAPI:
    app = FastAPI(title="Novel Recommend API", version="0.1.0")

    app.include_router(novels_router,prefix="/api")
    app.include_router(chapters_router,prefix="/api")
    app.include_router(users_router,prefix="/api")
    app.include_router(bookmarks_router,prefix="/api")
    app.include_router(histories_router,prefix="/api")

    return app


app = create_app()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)



