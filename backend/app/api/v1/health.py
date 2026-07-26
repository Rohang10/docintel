from fastapi import APIRouter
from app.core.config import settings

router = APIRouter()

@router.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "embedding_model": settings.EMBEDDING_MODEL,
        "llm_providers": {
            "gemini": bool(settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your-google-gemini-api-key"),
            "groq": bool(settings.GROQ_API_KEY and settings.GROQ_API_KEY != "your-groq-api-key")
        }
    }
