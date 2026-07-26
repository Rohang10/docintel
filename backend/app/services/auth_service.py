from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status

from app.models.tenant import Tenant
from app.models.user import UserProfile
from app.core.security import get_password_hash, verify_password, create_access_token
from app.schemas.auth import UserRegister, UserLogin, TokenResponse

class AuthService:
    async def register_user(self, db: AsyncSession, data: UserRegister) -> TokenResponse:
        # Check existing user
        result = await db.execute(select(UserProfile).where(UserProfile.email == data.email))
        if result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="User with this email already exists")

        # Create Tenant
        base_slug = data.tenant_name.lower().strip().replace(" ", "-")
        slug = base_slug
        slug_check = await db.execute(select(Tenant).where(Tenant.slug == slug))
        if slug_check.scalar_one_or_none():
            import uuid
            slug = f"{base_slug}-{uuid.uuid4().hex[:6]}"

        tenant = Tenant(name=data.tenant_name, slug=slug)
        db.add(tenant)
        await db.flush()

        # Create User Profile
        user = UserProfile(
            tenant_id=tenant.id,
            email=data.email,
            hashed_password=get_password_hash(data.password),
            role="admin",
            display_name=data.display_name or data.email.split("@")[0]
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

        token = create_access_token(subject=user.id, tenant_id=tenant.id, role=user.role)
        return TokenResponse(
            access_token=token,
            tenant_id=tenant.id,
            user_id=user.id,
            email=user.email,
            role=user.role,
            display_name=user.display_name,
            tenant_name=tenant.name
        )

    async def login_user(self, db: AsyncSession, data: UserLogin) -> TokenResponse:
        result = await db.execute(select(UserProfile).where(UserProfile.email == data.email))
        user = result.scalar_one_or_none()
        if not user or not verify_password(data.password, user.hashed_password):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

        tenant_result = await db.execute(select(Tenant).where(Tenant.id == user.tenant_id))
        tenant = tenant_result.scalar_one_or_none()

        token = create_access_token(subject=user.id, tenant_id=user.tenant_id, role=user.role)
        return TokenResponse(
            access_token=token,
            tenant_id=user.tenant_id,
            user_id=user.id,
            email=user.email,
            role=user.role,
            display_name=user.display_name or user.email.split("@")[0],
            tenant_name=tenant.name if tenant else "Workspace"
        )

auth_service = AuthService()
