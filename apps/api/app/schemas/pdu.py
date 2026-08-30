from typing import Any

from pydantic import BaseModel, Field


class PayloadIn(BaseModel):
    payload: str = Field(min_length=1, max_length=10_000)


class DecapsulateIn(BaseModel):
    encapsulatedData: dict[str, Any]


class PDUResponse(BaseModel):
    success: bool = True
    message: str
    data: dict[str, Any]
