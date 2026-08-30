import logging

from fastapi import Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger(__name__)


async def validation_error_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
    return JSONResponse(
        status_code=422,
        content={"error": "Validation failed", "details": jsonable_encoder(exc.errors())},
    )


async def http_error_handler(_: Request, exc: StarletteHTTPException) -> JSONResponse:
    detail = exc.detail if isinstance(exc.detail, str) else "Request failed"
    return JSONResponse(status_code=exc.status_code, content={"error": detail})


async def database_error_handler(_: Request, exc: SQLAlchemyError) -> JSONResponse:
    logger.exception("Database operation failed", exc_info=exc)
    return JSONResponse(status_code=503, content={"error": "Service temporarily unavailable"})


async def unhandled_error_handler(_: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled application error", exc_info=exc)
    return JSONResponse(status_code=500, content={"error": "Internal server error"})
