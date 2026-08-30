from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class LoginIn(BaseModel):
    username: str = Field(min_length=1, max_length=80)
    password: str = Field(min_length=1, max_length=256)


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    username: str


class LoginOut(BaseModel):
    token: str | None = Field(
        default=None, description="Deprecated; authentication uses HttpOnly cookies"
    )
    user: UserOut


class VerifyOut(BaseModel):
    valid: bool
    user: UserOut
