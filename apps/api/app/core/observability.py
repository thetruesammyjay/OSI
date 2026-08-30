import logging
import uuid

from fastapi import Request


def configure_logging(level: str) -> None:
    logging.basicConfig(
        level=getattr(logging, level.upper(), logging.INFO),
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )


def request_id(request: Request) -> str:
    return request.headers.get("x-request-id") or str(uuid.uuid4())
