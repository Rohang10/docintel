from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.schemas.auth import UserRegister, UserLogin, TokenResponse, UserProfileResponse
from app.services.auth_service import auth_service
from app.api.deps import get_current_user_claims
from app.models.tenant import Tenant
from app.models.user import UserProfile

router = APIRouter()

@router.post("/register", response_model=TokenResponse)
async def register(data: UserRegister, db: AsyncSession = Depends(get_db)):
    return await auth_service.register_user(db, data)

@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    return await auth_service.login_user(db, data)

@router.get("/me", response_model=UserProfileResponse)
async def get_me(claims: dict = Depends(get_current_user_claims), db: AsyncSession = Depends(get_db)):
    tenant_id = claims["tenant_id"]
    user_id = claims["sub"]

    tenant_result = await db.execute(select(Tenant).where(Tenant.id == tenant_id))
    tenant = tenant_result.scalar_one_or_none()

    user_result = await db.execute(select(UserProfile).where(UserProfile.id == user_id))
    user = user_result.scalar_one_or_none()

    return UserProfileResponse(
        id=user_id,
        tenant_id=tenant_id,
        email=claims.get("email", user.email if user else "user@docintel.com"),
        role=claims.get("role", "member"),
        display_name=user.display_name if user else "Enterprise User",
        tenant_name=tenant.name if tenant else "Default Workspace"
    )
