from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.api.dependencies import get_db, get_current_active_user
from app.models.user import User
from app.models.content import Post, ContentTemplate
from app.schemas.content import (
    ContentGenerationRequest,
    GeneratedContent,
    PostCreate,
    Post as PostSchema,
    ContentTemplateCreate,
    ContentTemplate as ContentTemplateSchema
)
from app.services.claude_service import claude_service
from app.services.perplexity_service import perplexity_service

router = APIRouter()


@router.post("/generate", response_model=List[GeneratedContent])
async def generate_content(
    request: ContentGenerationRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Generate content for multiple platforms"""
    
    generated_content = []
    research_data = None
    
    # Perform research if requested
    if request.include_research:
        try:
            research_data = await perplexity_service.research_topic(
                request.topic,
                request.additional_context
            )
        except Exception as e:
            # Continue without research if it fails
            print(f"Research failed: {e}")
            research_data = None
    
    # Generate content for each platform
    for platform in request.platforms:
        try:
            # Use user's API key if available
            user_claude_key = current_user.anthropic_api_key
            if user_claude_key:
                # Create a new service instance with user's key
                user_claude_service = type(claude_service)(user_claude_key)
                content = await user_claude_service.generate_content(
                    request.topic,
                    platform.value,
                    research_data,
                    request.additional_context
                )
            else:
                content = await claude_service.generate_content(
                    request.topic,
                    platform.value,
                    research_data,
                    request.additional_context
                )
            
            # Extract hashtags if present
            hashtags = []
            if platform.value == "linkedin":
                import re
                hashtags = re.findall(r'#(\w+)', content)
                hashtags = hashtags[:5]  # Limit to 5 hashtags
            
            generated_content.append(GeneratedContent(
                platform=platform,
                content=content,
                character_count=len(content),
                hashtags=hashtags if hashtags else None,
                research_data=research_data
            ))
            
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Content generation failed for {platform.value}: {str(e)}"
            )
    
    return generated_content


@router.post("/posts", response_model=PostSchema)
async def create_post(
    post_data: PostCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Create a new post"""
    
    db_post = Post(
        user_id=current_user.id,
        topic=post_data.topic,
        content=post_data.content,
        platform=post_data.platform,
        research_data=post_data.research_data
    )
    
    db.add(db_post)
    await db.commit()
    await db.refresh(db_post)
    
    return db_post


@router.get("/posts", response_model=List[PostSchema])
async def get_posts(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Get user's posts"""
    
    stmt = select(Post).where(Post.user_id == current_user.id).offset(skip).limit(limit)
    result = await db.execute(stmt)
    posts = result.scalars().all()
    
    return posts


@router.get("/posts/{post_id}", response_model=PostSchema)
async def get_post(
    post_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Get a specific post"""
    
    stmt = select(Post).where(Post.id == post_id, Post.user_id == current_user.id)
    result = await db.execute(stmt)
    post = result.scalar_one_or_none()
    
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    return post


@router.post("/variations")
async def generate_variations(
    post_id: int,
    count: int = 3,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Generate variations of existing content"""
    
    # Get the original post
    stmt = select(Post).where(Post.id == post_id, Post.user_id == current_user.id)
    result = await db.execute(stmt)
    post = result.scalar_one_or_none()
    
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    try:
        # Use user's API key if available
        user_claude_key = current_user.anthropic_api_key
        if user_claude_key:
            user_claude_service = type(claude_service)(user_claude_key)
            variations = await user_claude_service.generate_variations(
                post.content,
                post.platform.value,
                count
            )
        else:
            variations = await claude_service.generate_variations(
                post.content,
                post.platform.value,
                count
            )
        
        return {
            "original_content": post.content,
            "variations": variations
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Variation generation failed: {str(e)}"
        )


@router.post("/templates", response_model=ContentTemplateSchema)
async def create_template(
    template_data: ContentTemplateCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Create a content template"""
    
    db_template = ContentTemplate(
        user_id=current_user.id,
        name=template_data.name,
        description=template_data.description,
        platform=template_data.platform,
        template=template_data.template
    )
    
    db.add(db_template)
    await db.commit()
    await db.refresh(db_template)
    
    return db_template


@router.get("/templates", response_model=List[ContentTemplateSchema])
async def get_templates(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Get user's content templates"""
    
    stmt = select(ContentTemplate).where(ContentTemplate.user_id == current_user.id)
    result = await db.execute(stmt)
    templates = result.scalars().all()
    
    return templates


@router.get("/trending-topics")
async def get_trending_topics(
    category: str = None,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Get trending topics for content inspiration"""
    
    try:
        # Use user's API key if available
        user_perplexity_key = current_user.perplexity_api_key
        if user_perplexity_key:
            user_perplexity_service = type(perplexity_service)(user_perplexity_key)
            topics = await user_perplexity_service.get_trending_topics(category)
        else:
            topics = await perplexity_service.get_trending_topics(category)
        
        return {"topics": topics}
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch trending topics: {str(e)}"
        )