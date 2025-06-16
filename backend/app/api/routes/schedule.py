from typing import List, Any
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.api.dependencies import get_db, get_current_active_user
from app.models.user import User
from app.models.content import Post, ScheduledPost
from app.schemas.content import (
    ScheduledPostCreate,
    ScheduledPost as ScheduledPostSchema
)

router = APIRouter()


@router.post("/schedule", response_model=ScheduledPostSchema)
async def schedule_post(
    schedule_data: ScheduledPostCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Schedule a post for future publishing"""
    
    # Verify the post exists and belongs to the user
    stmt = select(Post).where(
        Post.id == schedule_data.post_id,
        Post.user_id == current_user.id
    )
    result = await db.execute(stmt)
    post = result.scalar_one_or_none()
    
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Check if the scheduled time is in the future
    if schedule_data.scheduled_time <= datetime.utcnow():
        raise HTTPException(
            status_code=400,
            detail="Scheduled time must be in the future"
        )
    
    # Check if post is already scheduled
    stmt = select(ScheduledPost).where(ScheduledPost.post_id == schedule_data.post_id)
    result = await db.execute(stmt)
    existing_schedule = result.scalar_one_or_none()
    
    if existing_schedule:
        # Update existing schedule
        existing_schedule.scheduled_time = schedule_data.scheduled_time
        existing_schedule.is_posted = False
        existing_schedule.error_message = None
        
        await db.commit()
        await db.refresh(existing_schedule)
        
        # TODO: Update Celery task
        
        return existing_schedule
    
    # Create new scheduled post
    db_scheduled_post = ScheduledPost(
        post_id=schedule_data.post_id,
        user_id=current_user.id,
        scheduled_time=schedule_data.scheduled_time
    )
    
    db.add(db_scheduled_post)
    await db.commit()
    await db.refresh(db_scheduled_post)
    
    # TODO: Create Celery task for publishing
    
    return db_scheduled_post


@router.get("/scheduled", response_model=List[ScheduledPostSchema])
async def get_scheduled_posts(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Get user's scheduled posts"""
    
    stmt = (
        select(ScheduledPost)
        .where(ScheduledPost.user_id == current_user.id)
        .where(ScheduledPost.is_posted == False)
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(stmt)
    scheduled_posts = result.scalars().all()
    
    return scheduled_posts


@router.delete("/scheduled/{scheduled_post_id}")
async def cancel_scheduled_post(
    scheduled_post_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Cancel a scheduled post"""
    
    stmt = select(ScheduledPost).where(
        ScheduledPost.id == scheduled_post_id,
        ScheduledPost.user_id == current_user.id
    )
    result = await db.execute(stmt)
    scheduled_post = result.scalar_one_or_none()
    
    if not scheduled_post:
        raise HTTPException(status_code=404, detail="Scheduled post not found")
    
    if scheduled_post.is_posted:
        raise HTTPException(status_code=400, detail="Post has already been published")
    
    # TODO: Cancel Celery task
    
    await db.delete(scheduled_post)
    await db.commit()
    
    return {"message": "Scheduled post cancelled successfully"}


@router.get("/calendar")
async def get_calendar_view(
    start_date: datetime,
    end_date: datetime,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Get calendar view of scheduled posts"""
    
    stmt = (
        select(ScheduledPost)
        .where(ScheduledPost.user_id == current_user.id)
        .where(ScheduledPost.scheduled_time >= start_date)
        .where(ScheduledPost.scheduled_time <= end_date)
        .order_by(ScheduledPost.scheduled_time)
    )
    result = await db.execute(stmt)
    scheduled_posts = result.scalars().all()
    
    # Format for calendar view
    calendar_events = []
    for scheduled_post in scheduled_posts:
        calendar_events.append({
            "id": scheduled_post.id,
            "title": scheduled_post.post.topic if scheduled_post.post else "Scheduled Post",
            "start": scheduled_post.scheduled_time.isoformat(),
            "platform": scheduled_post.post.platform.value if scheduled_post.post else "unknown",
            "status": "scheduled" if not scheduled_post.is_posted else "published",
            "content_preview": scheduled_post.post.content[:100] + "..." if scheduled_post.post and len(scheduled_post.post.content) > 100 else scheduled_post.post.content if scheduled_post.post else ""
        })
    
    return {"events": calendar_events}


@router.post("/publish-now/{post_id}")
async def publish_now(
    post_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Publish a post immediately"""
    
    # Get the post
    stmt = select(Post).where(
        Post.id == post_id,
        Post.user_id == current_user.id
    )
    result = await db.execute(stmt)
    post = result.scalar_one_or_none()
    
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if post.status.value == "published":
        raise HTTPException(status_code=400, detail="Post is already published")
    
    # TODO: Implement actual publishing logic
    # This would involve calling the appropriate social media API
    
    # For now, just update the status
    post.status = "published"
    post.published_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(post)
    
    return {"message": "Post published successfully", "post": post}