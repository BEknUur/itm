from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Per-bank tunables. Override with SAFESTEP_* env vars."""

    model_config = SettingsConfigDict(env_prefix="SAFESTEP_", env_file=".env")

    database_url: str = "postgresql+asyncpg://safestep:safestep@localhost:5433/safestep"
    test_database_url: str = "postgresql+asyncpg://safestep:safestep@localhost:5433/safestep_test"
    cors_origins: list[str] = ["http://localhost:5173"]

    risk_threshold: int = Field(50, ge=1, le=100)
    hold_minutes: int = Field(30, ge=30, le=120)
    unusual_amount_multiplier: float = 3.0
    large_p2p_amount: float = 500_000  # KZT
    failed_otp_min: int = 2
    max_step_up_attempts: int = 3
