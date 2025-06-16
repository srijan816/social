from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum


class Platform(str, Enum):
    twitter = "twitter"
    linkedin = "linkedin"


class PostStatus(str, Enum):
    draft = "draft"
    scheduled = "scheduled"
    published = "published"
    failed = "failed"


class AIProvider(str, Enum):
    claude = "claude"
    openai = "openai"
    gemini = "gemini"
    xai = "xai"


class ContentGenerationRequest(BaseModel):
    topic: str = Field(..., description="Topic for content generation")
    platforms: List[Platform] = Field(..., description="Platforms to generate content for")
    ai_provider: AIProvider = Field(AIProvider.claude, description="AI provider to use")
    include_research: bool = Field(True, description="Include Perplexity research")
    additional_context: Optional[str] = Field(None, description="Additional context for generation")


class ResearchData(BaseModel):
    query: str
    findings: List[Dict[str, Any]]
    sources: List[str]
    timestamp: datetime


class GeneratedContent(BaseModel):
    platform: Platform
    content: str
    character_count: int
    hashtags: Optional[List[str]] = None
    research_data: Optional[ResearchData] = None


class PostBase(BaseModel):
    topic: str
    content: str
    platform: Platform
    research_data: Optional[Dict[str, Any]] = None


class PostCreate(PostBase):
    pass


class PostUpdate(BaseModel):
    content: Optional[str] = None
    status: Optional[PostStatus] = None


class Post(PostBase):
    id: int
    user_id: int
    status: PostStatus
    platform_post_id: Optional[str]
    likes: int
    shares: int
    comments: int
    impressions: int
    created_at: datetime
    published_at: Optional[datetime]
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class ScheduledPostCreate(BaseModel):
    post_id: int
    scheduled_time: datetime


class ScheduledPost(BaseModel):
    id: int
    post_id: int
    user_id: int
    scheduled_time: datetime
    is_posted: bool
    error_message: Optional[str]
    created_at: datetime
    post: Optional[Post] = None
    
    class Config:
        from_attributes = True


class ContentTemplateCreate(BaseModel):
    name: str
    description: Optional[str] = None
    platform: Platform
    template: str


class ContentTemplate(ContentTemplateCreate):
    id: int
    user_id: int
    usage_count: int
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True