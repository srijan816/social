from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db, get_current_active_user
from app.models.user import User
from app.schemas.user import PlatformCredentials, UserAPIKeys
from app.services.x_service import XService
from app.services.linkedin_service import LinkedInService

router = APIRouter()


@router.post("/credentials")
async def update_platform_credentials(
    credentials: PlatformCredentials,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Update platform credentials for user"""
    
    if credentials.platform.lower() == "twitter":
        current_user.twitter_access_token = credentials.access_token
        current_user.twitter_access_token_secret = credentials.access_token_secret
        
    elif credentials.platform.lower() == "linkedin":
        current_user.linkedin_access_token = credentials.access_token
        
    else:
        raise HTTPException(status_code=400, detail="Unsupported platform")
    
    await db.commit()
    
    return {"message": f"{credentials.platform} credentials updated successfully"}


@router.post("/api-keys")
async def update_api_keys(
    api_keys: UserAPIKeys,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Update AI API keys for user"""
    
    if api_keys.anthropic_api_key:
        current_user.anthropic_api_key = api_keys.anthropic_api_key
    
    if api_keys.perplexity_api_key:
        current_user.perplexity_api_key = api_keys.perplexity_api_key
    
    await db.commit()
    
    return {"message": "API keys updated successfully"}


@router.get("/status")
async def get_platform_status(
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Get connection status for all platforms"""
    
    status = {
        "twitter": {
            "connected": bool(current_user.twitter_access_token),
            "valid": False
        },
        "linkedin": {
            "connected": bool(current_user.linkedin_access_token),
            "valid": False
        },
        "api_keys": {
            "anthropic": bool(current_user.anthropic_api_key),
            "perplexity": bool(current_user.perplexity_api_key)
        }
    }
    
    # Validate Twitter credentials
    if current_user.twitter_access_token:
        try:
            twitter_service = XService(
                current_user.twitter_access_token,
                current_user.twitter_access_token_secret
            )
            status["twitter"]["valid"] = await twitter_service.validate_credentials()
        except:
            status["twitter"]["valid"] = False
    
    # Validate LinkedIn credentials
    if current_user.linkedin_access_token:
        try:
            linkedin_service = LinkedInService(current_user.linkedin_access_token)
            status["linkedin"]["valid"] = await linkedin_service.validate_credentials()
        except:
            status["linkedin"]["valid"] = False
    
    return status


@router.delete("/credentials/{platform}")
async def remove_platform_credentials(
    platform: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Remove platform credentials"""
    
    if platform.lower() == "twitter":
        current_user.twitter_access_token = None
        current_user.twitter_access_token_secret = None
        
    elif platform.lower() == "linkedin":
        current_user.linkedin_access_token = None
        
    else:
        raise HTTPException(status_code=400, detail="Unsupported platform")
    
    await db.commit()
    
    return {"message": f"{platform} credentials removed successfully"}


@router.get("/limits")
async def get_platform_limits() -> Any:
    """Get character limits and posting limits for platforms"""
    
    return {
        "twitter": {
            "character_limit": 280,
            "posts_per_day": 2400,  # API limit
            "posts_per_hour": 300
        },
        "linkedin": {
            "character_limit": 3000,
            "posts_per_day": 100,  # Conservative estimate
            "posts_per_hour": 25
        }
    }


@router.post("/test-connection/{platform}")
async def test_platform_connection(
    platform: str,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Test connection to a specific platform"""
    
    if platform.lower() == "twitter":
        if not current_user.twitter_access_token:
            raise HTTPException(status_code=400, detail="Twitter credentials not configured")
        
        try:
            twitter_service = XService(
                current_user.twitter_access_token,
                current_user.twitter_access_token_secret
            )
            is_valid = await twitter_service.validate_credentials()
            
            return {
                "platform": "twitter",
                "connected": True,
                "valid": is_valid,
                "message": "Connection successful" if is_valid else "Invalid credentials"
            }
            
        except Exception as e:
            return {
                "platform": "twitter",
                "connected": False,
                "valid": False,
                "message": f"Connection failed: {str(e)}"
            }
    
    elif platform.lower() == "linkedin":
        if not current_user.linkedin_access_token:
            raise HTTPException(status_code=400, detail="LinkedIn credentials not configured")
        
        try:
            linkedin_service = LinkedInService(current_user.linkedin_access_token)
            is_valid = await linkedin_service.validate_credentials()
            
            return {
                "platform": "linkedin",
                "connected": True,
                "valid": is_valid,
                "message": "Connection successful" if is_valid else "Invalid credentials"
            }
            
        except Exception as e:
            return {
                "platform": "linkedin",
                "connected": False,
                "valid": False,
                "message": f"Connection failed: {str(e)}"
            }
    
    else:
        raise HTTPException(status_code=400, detail="Unsupported platform")