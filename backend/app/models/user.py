from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.models.database import Base


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    
    # API Keys (encrypted)
    anthropic_api_key = Column(String, nullable=True)
    perplexity_api_key = Column(String, nullable=True)
    
    # Social Media Credentials (encrypted)
    twitter_access_token = Column(String, nullable=True)
    twitter_access_token_secret = Column(String, nullable=True)
    linkedin_access_token = Column(String, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    posts = relationship("Post", back_populates="user")
    scheduled_posts = relationship("ScheduledPost", back_populates="user")