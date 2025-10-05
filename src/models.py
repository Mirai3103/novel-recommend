from enum import Enum as PyEnum
from pydantic import BaseModel
from sqlalchemy import Column, Date, Float, Integer, String, DateTime, ForeignKey, Enum, Index
from sqlalchemy.dialects.postgresql import JSONB, ARRAY, UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector
from .database import Base
import uuid


# -------------------- NOVEL --------------------
class Novel(Base):
    __tablename__ = "novels"

    id = Column(UUID, primary_key=True, index=True, unique=True, nullable=False, default=uuid.uuid4)
    title = Column(String, unique=True, nullable=False)  # Đã có unique index
    other_titles = Column(ARRAY(String))
    authors = Column(ARRAY(String))
    tags = Column(ARRAY(String))
    type = Column(String, index=True)  # Index cho filter theo type
    artists = Column(ARRAY(String))
    status = Column(String, index=True)  # Index cho filter theo status
    description = Column(String)
    meta = Column(JSONB)
    total_views = Column(Integer, default=0, index=True)  # Index cho sort by views
    total_favorites = Column(Integer, default=0, index=True)  # Index cho sort by favorites
    total_ratings = Column(Integer, default=0)
    average_rating = Column(Float, default=0, index=True)  # Index cho sort by rating
    image_url = Column(String)
    full_text = Column(String)
    embedding = Column(Vector(1536))
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), index=True)  # Index cho sort by update
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)  # Index cho sort by created
    latest_chapter_id = Column(UUID, ForeignKey("chapters.id"), nullable=True, index=True)

    # Relationships
    volumes = relationship("Volume", back_populates="novel", cascade="all, delete-orphan")

    # Composite indexes
    __table_args__ = (
        Index('ix_novels_status_views', 'status', 'total_views'),  # Filter + sort
        Index('ix_novels_type_rating', 'type', 'average_rating'),  # Filter + sort
        Index('ix_novels_created_desc', last_updated.desc()),  # Sort by newest
    )


# -------------------- VOLUME --------------------
class Volume(Base):
    __tablename__ = "volumes"

    id = Column(UUID, primary_key=True, index=True, unique=True, nullable=False, default=uuid.uuid4)
    novel_id = Column(UUID, ForeignKey("novels.id"), nullable=False, index=True)  # Index cho JOIN
    title = Column(String)
    order = Column(Integer)
    image_url = Column(String)
    meta = Column(JSONB)
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    novel = relationship("Novel", back_populates="volumes")
    chapters = relationship("Chapter", back_populates="volume", cascade="all, delete-orphan")

    # Composite index
    __table_args__ = (
        Index('ix_volumes_novel_order', 'novel_id', 'order'),  # Query volumes by novel, sorted
    )

    def __repr__(self):
        return f"<Volume(id={self.id}, title={self.title}, order={self.order})>"


# -------------------- CHAPTER --------------------
class Chapter(Base):
    __tablename__ = "chapters"

    id = Column(UUID, primary_key=True, index=True, unique=True, nullable=False, default=uuid.uuid4)
    volume_id = Column(UUID, ForeignKey("volumes.id"), nullable=False, index=True)  # Index cho JOIN
    title = Column(String)
    order = Column(Integer)
    meta = Column(JSONB)
    content = Column(String)
    last_updated = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    total_views = Column(Integer, default=0)

    # Relationships
    volume = relationship("Volume", back_populates="chapters")

    # Composite index
    __table_args__ = (
        Index('ix_chapters_volume_order', 'volume_id', 'order'),  # Query chapters by volume, sorted
    )

    def __repr__(self):
        return f"<Chapter(id={self.id}, title={self.title}, order={self.order})>"


# -------------------- USER --------------------
class User(Base):
    __tablename__ = "users"

    id = Column(UUID, primary_key=True, index=True, unique=True, nullable=False, default=uuid.uuid4)
    username = Column(String, unique=True, nullable=False)  # Unique index tự động
    email = Column(String, unique=True, nullable=False)  # Unique index tự động
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
    user_id = Column(UUID, ForeignKey("users.id"), nullable=False, index=True)  # Index cho JOIN
    novel_id = Column(UUID, ForeignKey("novels.id"), nullable=False, index=True)  # Index cho JOIN
    type = Column(Enum(BookmarkType, name="bookmark_type"), nullable=False)
    chapter_id = Column(UUID, ForeignKey("chapters.id"), nullable=True, index=True)  # Index cho JOIN
    line = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)  # Index cho sort

    # Relationships
    user = relationship("User")
    novel = relationship("Novel")
    chapter = relationship("Chapter")

    # Composite indexes
    __table_args__ = (
        Index('ix_bookmarks_user_novel', 'user_id', 'novel_id', unique=True),  # Unique bookmark per user-novel
        Index('ix_bookmarks_user_created', 'user_id', 'created_at'),  # User's bookmarks sorted
    )


# -------------------- HISTORY --------------------
class History(Base):
    __tablename__ = "histories"

    id = Column(UUID, primary_key=True, index=True, unique=True, nullable=False, default=uuid.uuid4)
    user_id = Column(UUID, ForeignKey("users.id"), nullable=False, index=True)  # Index cho JOIN
    novel_id = Column(UUID, ForeignKey("novels.id"), nullable=False, index=True)  # Index cho JOIN
    chapter_id = Column(UUID, ForeignKey("chapters.id"), nullable=False, index=True)  # Index cho JOIN
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)  # Index cho sort

    # Relationships
    user = relationship("User")
    novel = relationship("Novel")
    chapter = relationship("Chapter")

    # Composite indexes
    __table_args__ = (
        Index('ix_histories_user_created', 'user_id', 'created_at'),  # User's history sorted
        Index('ix_histories_user_novel', 'user_id', 'novel_id'),  # User's history per novel
    )


# -------------------- RATING --------------------
class Rating(Base):
    __tablename__ = "ratings"

    id = Column(UUID, primary_key=True, index=True, unique=True, nullable=False, default=uuid.uuid4)
    user_id = Column(UUID, ForeignKey("users.id"), nullable=False, index=True)  # Index cho JOIN
    novel_id = Column(UUID, ForeignKey("novels.id"), nullable=False, index=True)  # Index cho JOIN
    rating = Column(Integer, nullable=False)
    content = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)  # Index cho sort

    # Relationships
    user = relationship("User")
    novel = relationship("Novel")

    # Composite index
    __table_args__ = (
        Index('ix_ratings_user_novel', 'user_id', 'novel_id', unique=True),  # Unique rating per user-novel
        Index('ix_ratings_novel_created', 'novel_id', 'created_at'),  # Novel's ratings sorted
    )


# -------------------- VIEW STATS --------------------
class ViewStats(Base):
    __tablename__ = "view_stats"

    id = Column(UUID, primary_key=True, index=True, unique=True, nullable=False, default=uuid.uuid4)
    novel_id = Column(UUID, ForeignKey("novels.id"), nullable=False, index=True)  # Index cho JOIN
    chapter_id = Column(UUID, ForeignKey("chapters.id"), nullable=False, index=True)  # Index cho JOIN
    date = Column(Date, nullable=False, index=True)  # Index cho filter by date
    views = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    novel = relationship("Novel")
    chapter = relationship("Chapter")

    # Composite indexes
    __table_args__ = (
        Index('ix_view_stats_novel_date', 'novel_id', 'date'),  # Stats per novel by date
        Index('ix_view_stats_chapter_date', 'chapter_id', 'date', unique=True),  # Unique stat per chapter-date
    )