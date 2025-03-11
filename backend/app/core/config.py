# from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings:  # (BaseSettings)
    APP_NAME: str = "ActiveResident"
    DEBUG: bool = True
    DATABASE_URL: str


settings = Settings()
