from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path


class Settings(BaseSettings):
    APP_NAME: str = "ActiveResident"
    DEBUG: bool = True
    DATABASE_URL: str

    # JWT TOKEN SETTINGS
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30  # 30 minutes
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    ALGORITHM: str = "HS256"
    JWT_SECRET_KEY: str  # Ensure .env holds the value
    JWT_REFRESH_SECRET_KEY: str  # Ensure .env holds the value

    # Directories
    REPORT_PHOTOS: Path = Path(__file__).resolve().parent.parent.parent / "photos"

    # tricky stuff here
    # it looks for the env_file in current working dir (cwd)
    # and it happens to be whereever you launch code from
    # so we have two options:
    # 1) always run the server from the same directory (e.g. backend)
    # 2) provide an absolute path of the .env
    # 2nd option looks much more robust, that is why I left it here
    # it will always look for .env in the /backend directory
    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).resolve().parent.parent.parent / ".env")
    )
