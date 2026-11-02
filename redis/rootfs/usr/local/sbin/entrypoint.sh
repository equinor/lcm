#!/usr/bin/env sh
set -eu

if [ "${TRACE:-}" = "1" ]; then
    set -x
fi

if [ -z "${REDIS_PASSWORD:-}" ]; then
    if [ -z "${REDIS_PASSWORD_FILE:-}" ]; then
        echo "REDIS_PASSWORD or REDIS_PASSWORD_FILE must be set" >/dev/stderr
        exit 1
    else
        REDIS_PASSWORD="$(cat "$REDIS_PASSWORD_FILE")"
        export REDIS_PASSWORD
    fi
fi

if test -n "${1:-}" && [ "$1" != "redis-server" ]; then
    exec "$@"
fi

[ "${1:-}" = "redis-server" ] && shift # Remove duplicate redis-server argument if present
exec redis-server --requirepass "$REDIS_PASSWORD" --save "" "$@"
