#!/usr/bin/env sh
set -eu

if [ -z "${REDIS_PASSWORD:-}" ] && [ -n "${REDIS_PASSWORD_FILE:-}" ]; then
    REDIS_PASSWORD="$(cat "$REDIS_PASSWORD_FILE")"
fi

REDISCLI_AUTH="${REDIS_PASSWORD:-}" redis-cli ping
