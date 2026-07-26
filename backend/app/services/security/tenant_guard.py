from fastapi import HTTPException, status

class TenantGuard:
    @staticmethod
    def verify_tenant_access(user_tenant_id: str, resource_tenant_id: str):
        if str(user_tenant_id) != str(resource_tenant_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: Cross-tenant data boundary violation"
            )

tenant_guard = TenantGuard()
