#!/bin/sh

if [ "$1" = 'api' ]; then
  flask run --host=0.0.0.0
else
  exec "$@"
fi