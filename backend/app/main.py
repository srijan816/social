from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.api.routes import auth, content, schedule, platforms
from app.models.database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    yield
    # Shutdown
    pass


app = FastAPI(
    title="SocialAI Pro API",
    description="AI-powered social media content automation platform",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(content.router, prefix="/api/content", tags=["content"])
app.include_router(schedule.router, prefix="/api/schedule", tags=["schedule"])
app.include_router(platforms.router, prefix="/api/platforms", tags=["platforms"])


@app.get("/")
async def root():
    return {"message": "Welcome to SocialAI Pro API"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}