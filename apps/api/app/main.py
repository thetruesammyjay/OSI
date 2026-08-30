import logging
import time
from collections.abc import AsyncIterator, Awaitable, Callable
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import SQLAlchemyError
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.responses import Response

from app.api.routes import auth, faqs, feedback, health, pdu, quizzes
from app.core.config import get_settings
from app.core.errors import (
    database_error_handler,
    http_error_handler,
    unhandled_error_handler,
    validation_error_handler,
)
from app.core.observability import configure_logging, request_id

settings = get_settings()
configure_logging(settings.log_level)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    settings.validate_for_runtime()
    logger.info("Starting OSI API", extra={"environment": settings.environment})
    yield
    logger.info("Stopping OSI API")


app = FastAPI(
    title="OSI Model Learning Platform API",
    version="0.1.0",
    docs_url=None if settings.environment == "production" else "/docs",
    redoc_url=None if settings.environment == "production" else "/redoc",
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def request_context(
    request: Request, call_next: Callable[[Request], Awaitable[Response]]
) -> Response:
    started = time.perf_counter()
    rid = request_id(request)
    response = await call_next(request)
    response.headers["X-Request-ID"] = rid
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    logger.info(
        "%s %s %s %.1fms",
        request.method,
        request.url.path,
        response.status_code,
        (time.perf_counter() - started) * 1000,
        extra={"request_id": rid},
    )
    return response


app.add_exception_handler(RequestValidationError, validation_error_handler)  # type: ignore[arg-type]
app.add_exception_handler(StarletteHTTPException, http_error_handler)  # type: ignore[arg-type]
app.add_exception_handler(SQLAlchemyError, database_error_handler)  # type: ignore[arg-type]
app.add_exception_handler(Exception, unhandled_error_handler)
app.include_router(health.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(faqs.router, prefix="/api")
app.include_router(feedback.router, prefix="/api")
app.include_router(quizzes.router, prefix="/api")
app.include_router(pdu.router, prefix="/api")
