#!/bin/sh

if [ "$1" = 'api' ]; then

  echo "Loading test data...."

  python /code/util/load_test_data.py

  echo "Starting running...."

  flask run --host=0.0.0.0

else
  exec "$@"
fi