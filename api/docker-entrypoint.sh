#!/bin/sh

if [ "$1" = 'api' ]; then
  python /app/util/load_test_data.py

  flask run --host=0.0.0.0
else
  exec "$@"
fi