from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Enum, JSON, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from app.models.database import Base


class Platform(enum.Enum):
    TWITTER = "twitter"
    LINKEDIN = "linkedin"


class PostStatus(enum.Enum):
    DRAFT = "draft"
    SCHEDULED = "scheduled"
    PUBLISHED = "published"
    FAILED = "failed"


class Post(Base):
    __tablename__ = "posts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Content
    topic = Column(String, nullable=False)
    research_data = Column(JSON, nullable=True)  # Store Perplexity research
    content = Column(Text, nullable=False)
    platform = Column(Enum(Platform), nullable=False)
    
    # Metadata
    status = Column(Enum(PostStatus), default=PostStatus.DRAFT)
    platform_post_id = Column(String, nullable=True)  # ID from Twitter/LinkedIn
    
    # Performance metrics
    likes = Column(Integer, default=0)
    shares = Column(Integer, default=0)
    comments = Column(Integer, default=0)
    impressions = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    published_at = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="posts")
    scheduled_post = relationship("ScheduledPost", back_populates="post", uselist=False)


class ScheduledPost(Base):
    __tablename__ = "scheduled_posts"
    
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"), unique=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Scheduling
    scheduled_time = Column(DateTime(timezone=True), nullable=False, index=True)
    celery_task_id = Column(String, nullable=True)
    
    # Status
    is_posted = Column(Boolean, default=False)
    error_message = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    post = relationship("Post", back_populates="scheduled_post")
    user = relationship("User", back_populates="scheduled_posts")


class ContentTemplate(Base):
    __tablename__ = "content_templates"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    platform = Column(Enum(Platform), nullable=False)
    template = Column(Text, nullable=False)
    
    # Usage tracking
    usage_count = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())