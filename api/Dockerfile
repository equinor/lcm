FROM python:3.8-slim

ENV PYTHONUNBUFFERED=1
ENV FLASK_APP=/app/app.py
ENV PYTHONPATH=/app

RUN pip install poetry

WORKDIR /app

COPY pyproject.toml poetry.lock ./

# RUN poetry update

RUN poetry export -f requirements.txt --dev | pip install -r /dev/stdin

COPY . .

ENTRYPOINT ["/app/docker-entrypoint.sh"]

CMD ["api"]
