import json
from functools import wraps

import jwt
import requests
from cachetools import cached, TTLCache
from flask import abort, g, request
from jwt.algorithms import RSAAlgorithm

from config import Config
from classes.user import User
from util.exceptions import AuthenticationException


@cached(cache=TTLCache(maxsize=128, ttl=86400))
def get_cert(key_id):
    """
    Fetches JSON-Web-Keys from the env AUTH_JWK_URL url
    Returns a RSA PEM byte object from the key with the same 'kid' as the token.
    Time-To-Live cache that expires every 24h
    """
    try:
        jwks = requests.get(Config.AUTH_JWK_URL).json()["keys"]
        return next((RSAAlgorithm.from_jwk(json.dumps(key)) for key in jwks if key["kid"] == key_id))
    except requests.RequestException as error:
        raise AuthenticationException(str(error))


def decode_jwt(token):
    try:
        # If Auth is configured with a secret, we use that to decode the token
        if Config.AUTH_SECRET:
            decoded_token = jwt.decode(
                token, Config.AUTH_SECRET, algorithms="HS256", audience=Config.AUTH_JWT_AUDIENCE
            )
        # If no secret provided, fallback to RSA based token signing.
        else:
            cert = get_cert(jwt.get_unverified_header(token)["kid"])
            decoded_token = jwt.decode(token, cert, algorithms="RS256", audience=Config.AUTH_JWT_AUDIENCE)
        # Add a user object to the global flask context
        g.user = User(**decoded_token)
        return decoded_token
    except Exception as e:
        raise AuthenticationException(str(e))


def authorize(f):
    @wraps(f)
    def wrap(*args, **kwargs):
        if "Authorization" not in request.headers:
            abort(401, "Missing 'Authorization' header")
        try:
            token = request.headers["Authorization"].split(" ", 1)[1]
            decode_jwt(token)
        except (AuthenticationException, IndexError, Exception) as e:
            print(f"AUTH ERROR: {e}")
            # Return a generic auth error, no specifics
            abort(401, "Failed to authorize the request")

        return f(*args, **kwargs)

    return wrap
