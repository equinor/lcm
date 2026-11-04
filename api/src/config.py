from pathlib import Path
from typing import Annotated, ClassVar

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


class Config(BaseSettings):
    # Empty env vars (e.g. unset Docker build args) fall back to the defaults below
    model_config = SettingsConfigDict(env_ignore_empty=True)

    # Azure Storage
    TABLE_ACCOUNT_NAME: Annotated[str, Field(description="Name of the Azure Storage account")] = "lcmdevstorage"
    TABLE_KEY: Annotated[str | None, Field(description="Access key for the Azure Storage account")] = None
    BLOB_CONTAINER_NAME: ClassVar[str] = "lcm-file-blobs"
    PRODUCT_TABLE_NAME: ClassVar[str] = "products"

    # Logging
    APPINSIGHTS_CON_STRING: Annotated[str | None, Field(description="Application Insights connection string")] = None

    # SharePoint synchronization
    SYNC_BLOBS_APP_URL: Annotated[
        str | None, Field(description="HTTP trigger URL of the Logic App that copies SharePoint files to blob storage")
    ] = None

    # Authentication
    AUTH_SECRET: Annotated[
        str | None, Field(description="Shared HS256 secret for validating tokens (local testing only)")
    ] = None
    AUTH_JWT_AUDIENCES: Annotated[
        list[str], NoDecode, Field(description="Comma-separated list of accepted JWT audiences")
    ] = ["api://lost-circulation-material-api", "1dbc1e96-268d-41ad-894a-92a9fb85f954"]
    AUTH_JWT_ISSUER: Annotated[str | None, Field(description="Expected JWT issuer. Not validated when unset")] = None
    AUTH_OIDC_WELL_KNOWN: Annotated[str, Field(description="OpenID Connect discovery document URL")] = (
        "https://login.microsoftonline.com/3aa4a235-b6e2-48d5-9195-7fcf05b459b0/v2.0/.well-known/openid-configuration"
    )

    # Github
    GIT_TAG: Annotated[str, Field(description="Git tag for the current release version")] = "local version"
    GIT_COMMIT_HASH: Annotated[str, Field(description="Git commit hash of the latest commit in the repository")] = (
        "local development"
    )

    # Application
    HOME_DIR: ClassVar[str] = str(Path(__file__).parent.absolute())
    NAMED_SUPPLIERS: ClassVar[tuple[str, ...]] = ("Baker Hughes", "Halliburton", "Schlumberger")

    @field_validator("AUTH_JWT_AUDIENCES", mode="before")
    @classmethod
    def _split_audiences(cls, value: str | list[str]) -> list[str]:
        if isinstance(value, str):
            return [audience.strip() for audience in value.split(",") if audience.strip()]
        return value


config = Config()
