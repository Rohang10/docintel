from pydantic import BaseModel, EmailStr
from typing import Optional

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    tenant_name: str
    display_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    tenant_id: str
    user_id: str
    email: str
    role: str
    display_name: Optional[str] = None
    tenant_name: Optional[str] = None

class UserProfileResponse(BaseModel):
    id: str
    tenant_id: str
    email: str
    role: str
    display_name: Optional[str]
    tenant_name: str
