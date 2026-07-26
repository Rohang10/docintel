import time
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.logging import logger

class TenantAndAuditMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        origin = request.headers.get("origin", "*")
        
        # Handle Preflight OPTIONS requests directly to prevent CORS preflight block
        if request.method == "OPTIONS":
            response = Response(status_code=200)
            response.headers["Access-Control-Allow-Origin"] = origin if origin != "*" else "*"
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
            response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type, X-Tenant-ID, Accept, Origin, X-Requested-With"
            response.headers["Access-Control-Max-Age"] = "86400"
            return response

        start_time = time.time()
        tenant_id = request.headers.get("X-Tenant-ID", "anonymous")
        request.state.tenant_id = tenant_id

        response = await call_next(request)

        # Inject CORS headers on all outgoing API responses
        response.headers["Access-Control-Allow-Origin"] = origin if origin != "*" else "*"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
        response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type, X-Tenant-ID, Accept, Origin, X-Requested-With"

        process_time = (time.time() - start_time) * 1000
        response.headers["X-Process-Time-Ms"] = f"{process_time:.2f}"

        if not request.url.path.endswith("/health"):
            logger.info(
                f"API Request: {request.method} {request.url.path} status={response.status_code} duration={process_time:.2f}ms",
                extra={"tenant_id": tenant_id}
            )

        return response
