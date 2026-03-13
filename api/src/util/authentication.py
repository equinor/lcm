import logging

import jwt
import requests
from cachetools import TTLCache, cached
from flask import abort, g, request

from classes.user import User
from config import Config
from util.exceptions import AuthenticationException

_logger = logging.getLogger("API")


@cached(cache=TTLCache(maxsize=1, ttl=86400))
def _get_jwk_client() -> jwt.PyJWKClient:
    try:
        oid_conf = requests.get(Config.AUTH_OIDC_WELL_KNOWN, timeout=30).json()
        return jwt.PyJWKClient(oid_conf["jwks_uri"])
    except requests.RequestException as error:
        _logger.error(f"Failed to fetch OpenId Connect configuration for '{Config.AUTH_OIDC_WELL_KNOWN}': {error}")
        raise AuthenticationException(str(error)) from error


def decode_jwt(token: str) -> dict:
    try:
        if Config.AUTH_SECRET:
            return jwt.decode(token, Config.AUTH_SECRET, algorithms=["HS256"], audience=Config.AUTH_JWT_AUDIENCES)
        signing_key = _get_jwk_client().get_signing_key_from_jwt(token).key
        options = {"algorithms": ["RS256"], "audience": Config.AUTH_JWT_AUDIENCES}
        if Config.AUTH_JWT_ISSUER:
            options["issuer"] = Config.AUTH_JWT_ISSUER
        return jwt.decode(token, signing_key, **options)
    except Exception as e:
        raise AuthenticationException(str(e)) from e


def authenticate_request() -> None:
    if "Authorization" not in request.headers:
        abort(401, "Missing 'Authorization' header")
    try:
        token = request.headers["Authorization"].split(" ", 1)[1]
        g.user = User.from_jwt(decode_jwt(token))
    except Exception as e:
        _logger.warning("Auth failure: %s", e)
        abort(401, "Failed to authorize the request")
