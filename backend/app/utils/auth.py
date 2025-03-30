import os
from datetime import datetime, timedelta, UTC
from typing import Union, Any
from jose import jwt
from app.dependencies.common import getSettings


def getAccessToken(subject: Union[str, Any], expires_delta: int = None) -> str:
    settings = getSettings()
    if expires_delta is not None:
        expires_delta = datetime.now(UTC) + expires_delta
    else:
        expires_delta = datetime.now(UTC) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode = {"exp": expires_delta, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, settings.ALGORITHM)
    return encoded_jwt


def getRefreshToken(subject: Union[str, Any], expires_delta: int = None) -> str:
    settings = getSettings()
    if expires_delta is not None:
        expires_delta = datetime.now(UTC) + expires_delta
    else:
        expires_delta = datetime.now(UTC) + timedelta(
            minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES
        )

    to_encode = {"exp": expires_delta, "sub": str(subject)}
    encoded_jwt = jwt.encode(
        to_encode, settings.JWT_REFRESH_SECRET_KEY, settings.ALGORITHM
    )
    return encoded_jwt
