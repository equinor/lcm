#! /usr/bin/env bash

if [ "$1" = 'api' ]; then
  if [ "$FLASK_DEBUG" = 'true' ]; then
        flask run --host=0.0.0.0
    else
        gunicorn -b 0.0.0.0:5000 \
            --worker-tmp-dir /dev/shm \
            --capture-output \
            --enable-stdio-inheritance \
            --access-logfile=- \
            --log-file=- \
            --workers 4 \
            --timeout 60 \
            src/app:app
    fi
else
  exec "$@"
fi
