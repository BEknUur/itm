from contextlib import asynccontextmanager

from dishka.integrations.fastapi import setup_dishka
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncEngine

from app.core.config import Settings
from app.core.di import build_container
from app.domain.errors import (
    DomainError,
    InvalidPaymentState,
    NotFound,
    StepUpLocked,
    UntrustedDevice,
)
from app.infrastructure.db.seed import init_db
from app.presentation.api import agent, payments

_STATUS = {NotFound: 404, InvalidPaymentState: 409, UntrustedDevice: 403, StepUpLocked: 423}


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or Settings()
    container = build_container(settings)

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        await init_db(await container.get(AsyncEngine))
        yield
        await container.close()

    app = FastAPI(title="SafeStep API", lifespan=lifespan)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.middleware("http")
    async def never_cache_demo_api(request: Request, call_next):
        response = await call_next(request)
        if request.url.path.startswith("/api/"):
            # External rewrites must not cache a payment's old state or audit.
            response.headers["Cache-Control"] = "no-store"
            response.headers["CDN-Cache-Control"] = "no-store"
            response.headers["Vercel-CDN-Cache-Control"] = "no-store"
        return response

    @app.exception_handler(DomainError)
    async def domain_error(_: Request, exc: DomainError):
        return JSONResponse({"detail": str(exc)}, status_code=_STATUS.get(type(exc), 400))

    @app.get("/api/health")
    async def health():
        return {"status": "ok"}

    app.include_router(payments.router, prefix="/api")
    app.include_router(agent.router, prefix="/api")
    setup_dishka(container, app)
    return app


app = create_app()
