FROM python:3.8-slim

ENV PYTHONUNBUFFERED=1
ENV FLASK_APP=/app/app.py
ENV PYTHONPATH=/app

RUN pip install poetry
RUN poetry config virtualenvs.create false

WORKDIR /app

COPY pyproject.toml poetry.lock ./

RUN poetry install

COPY . .

ENTRYPOINT ["/app/docker-entrypoint.sh"]

CMD ["api"]
