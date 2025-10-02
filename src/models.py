from enum import Enum as PyEnum
from sqlalchemy import Column, Date, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import JSONB, ARRAY, UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base
import uuid


# -------------------- NOVEL --------------------
class Novel(Base):
    __tablename__ = "novels"

    id = Column(UUID, primary_key=True, index=True, unique=True, nullable=False, default=uuid.uuid4)
    title = Column(String, unique=True, index=True, nullable=False)
    other_titles = Column(ARRAY(String))
    authors = Column(ARRAY(String))
    tags = Column(ARRAY(String))
    type = Column(String)
    artists = Column(ARRAY(String))
    status = Column(String)
    description = Column(String)
    meta = Column(JSONB)
    image_url = Column(String)

    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 2 chiều với Volume
    volumes = relationship("Volume", back_populates="novel", cascade="all, delete-orphan")


# -------------------- VOLUME --------------------
class Volume(Base):
    __tablename__ = "volumes"

    id = Column(UUID, primary_key=True, index=True, unique=True, nullable=False, default=uuid.uuid4)
    novel_id = Column(UUID, ForeignKey("novels.id"), nullable=False)
    title = Column(String)
    order = Column(Integer)
    image_url = Column(String)
    meta = Column(JSONB)

    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 2 chiều với Novel và Chapter
    novel = relationship("Novel", back_populates="volumes")
    chapters = relationship("Chapter", back_populates="volume", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Volume(id={self.id}, title={self.title}, order={self.order})>"


# -------------------- CHAPTER --------------------
class Chapter(Base):
    __tablename__ = "chapters"

    id = Column(UUID, primary_key=True, index=True, unique=True, nullable=False, default=uuid.uuid4)
    volume_id = Column(UUID, ForeignKey("volumes.id"), nullable=False)
    title = Column(String)
    order = Column(Integer)
    meta = Column(JSONB)
    content = Column(String)

    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 2 chiều với Volume
    volume = relationship("Volume", back_populates="chapters")

    def __repr__(self):
        return f"<Chapter(id={self.id}, title={self.title}, order={self.order})>"


# -------------------- USER --------------------
class User(Base):
    __tablename__ = "users"

    id = Column(UUID, primary_key=True, index=True, unique=True, nullable=False, default=uuid.uuid4)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    avatar_url = Column(String)

    created_at = Column(DateTime(timezone=True), server_default=func.now())


# -------------------- BOOKMARK --------------------
class BookmarkType(PyEnum):
    NOVEL = "novel"
    CHAPTER = "chapter"


class Bookmark(Base):
    __tablename__ = "bookmarks"

    id = Column(UUID, primary_key=True, index=True, unique=True, nullable=False, default=uuid.uuid4)
    user_id = Column(UUID, ForeignKey("users.id"), nullable=False)
    novel_id = Column(UUID, ForeignKey("novels.id"), nullable=False)
    type = Column(Enum(BookmarkType, name="bookmark_type"), nullable=False)
    chapter_id = Column(UUID, ForeignKey("chapters.id"), nullable=True)
    line = Column(Integer, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Một chiều: chỉ Bookmark biết User/Novel/Chapter
    user = relationship("User")
    novel = relationship("Novel")
    chapter = relationship("Chapter")


# -------------------- HISTORY --------------------
class History(Base):
    __tablename__ = "histories"

    id = Column(UUID, primary_key=True, index=True, unique=True, nullable=False, default=uuid.uuid4)
    user_id = Column(UUID, ForeignKey("users.id"), nullable=False)
    novel_id = Column(UUID, ForeignKey("novels.id"), nullable=False)
    chapter_id = Column(UUID, ForeignKey("chapters.id"), nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Một chiều
    user = relationship("User")
    novel = relationship("Novel")
    chapter = relationship("Chapter")


# -------------------- RATING --------------------
class Rating(Base):
    __tablename__ = "ratings"

    id = Column(UUID, primary_key=True, index=True, unique=True, nullable=False, default=uuid.uuid4)
    user_id = Column(UUID, ForeignKey("users.id"), nullable=False)
    novel_id = Column(UUID, ForeignKey("novels.id"), nullable=False)
    rating = Column(Integer, nullable=False)
    content = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Một chiều
    user = relationship("User")
    novel = relationship("Novel")


# -------------------- VIEW STATS --------------------
class ViewStats(Base):
    __tablename__ = "view_stats"

    id = Column(UUID, primary_key=True, index=True, unique=True, nullable=False, default=uuid.uuid4)
    novel_id = Column(UUID, ForeignKey("novels.id"), nullable=False)
    chapter_id = Column(UUID, ForeignKey("chapters.id"), nullable=False)
    date = Column(Date, nullable=False)
    views = Column(Integer, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Một chiều
    novel = relationship("Novel")
    chapter = relationship("Chapter")
