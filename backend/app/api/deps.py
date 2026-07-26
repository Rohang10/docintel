from typing import AsyncGenerator, Dict, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.security import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

async def get_current_user_claims(token: str = Depends(oauth2_scheme)) -> Dict[str, Any]:
    if not token:
        # Development fallback / anonymous mock context
        return {
            "sub": "8a70e9d5-0d1d-424b-87f4-269c2c8d1617",
            "tenant_id": "fcff133b-5a14-4d2b-96c1-9a64d0020bc3",
            "role": "admin",
            "email": "test@example.com"
        }

    claims = decode_access_token(token)
    if not claims or "sub" not in claims:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return claims
