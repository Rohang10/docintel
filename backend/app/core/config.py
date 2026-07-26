import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from typing import Optional, List, Union

class Settings(BaseSettings):
    PROJECT_NAME: str = "Secure Document Query System"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"
    
    # Auth
    JWT_SECRET_KEY: str = "super-secret-docintel-key-change-in-production-32chars"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # DB
    DATABASE_URL: str = "sqlite+aiosqlite:///./docintel.db"
    SUPABASE_URL: Optional[str] = None
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None
    SUPABASE_STORAGE_BUCKET: str = "documents"
    
    # LLM & Embeddings
    GEMINI_API_KEY: Optional[str] = None
    GROQ_API_KEY: Optional[str] = None
    EMBEDDING_MODEL: str = "gemini-embedding-001"  # Via Gemini API, zero local RAM
    HUGGINGFACE_API_KEY: Optional[str] = None
    
    # Redis
    UPSTASH_REDIS_REST_URL: Optional[str] = None
    UPSTASH_REDIS_REST_TOKEN: Optional[str] = None
    
    # CORS
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "https://*.vercel.app"
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                import json
                return json.loads(v)
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return []

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

