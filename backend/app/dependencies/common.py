from app.core import config
from functools import lru_cache


@lru_cache
def getSettings():
    return config.Settings()
