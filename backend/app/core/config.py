from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import validator


class Settings(BaseSettings):
    # Application
    PROJECT_NAME: str = "SocialAI Pro"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Database
    DATABASE_URL: str
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    # CORS
    BACKEND_CORS_ORIGINS: str = "http://localhost:3000"
    
    def get_cors_origins(self) -> List[str]:
        if isinstance(self.BACKEND_CORS_ORIGINS, str):
            return [origin.strip() for origin in self.BACKEND_CORS_ORIGINS.split(",")]
        return self.BACKEND_CORS_ORIGINS
    
    # AI API Keys
    ANTHROPIC_API_KEY: Optional[str] = None
    PERPLEXITY_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    XAI_API_KEY: Optional[str] = None
    
    # Gemini API Keys (multiple for rate limiting)
    GEMINI_API_KEY_1: Optional[str] = None
    GEMINI_API_KEY_2: Optional[str] = None
    GEMINI_API_KEY_3: Optional[str] = None
    GEMINI_API_KEY_4: Optional[str] = None
    
    def get_gemini_api_keys(self) -> List[str]:
        """Get list of available Gemini API keys"""
        keys = []
        for i in range(1, 5):
            key = getattr(self, f'GEMINI_API_KEY_{i}', None)
            if key:
                keys.append(key)
        return keys
    
    # Social Media Platforms
    TWITTER_API_KEY: Optional[str] = None
    TWITTER_API_SECRET: Optional[str] = None
    TWITTER_ACCESS_TOKEN: Optional[str] = None
    TWITTER_ACCESS_TOKEN_SECRET: Optional[str] = None
    
    LINKEDIN_CLIENT_ID: Optional[str] = None
    LINKEDIN_CLIENT_SECRET: Optional[str] = None
    
    # Celery
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"
    
    # AI Model Settings
    CLAUDE_MODEL: str = "claude-4-sonnet-20250514"
    PERPLEXITY_MODEL: str = "sonar-pro"
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()