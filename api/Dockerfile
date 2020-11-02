FROM python:3.8-slim

ENV PYTHONUNBUFFERED=1
ENV FLASK_APP=/app/app.py
ENV PYTHONPATH=/app
ENV PATH="/root/.poetry/bin:${PATH}"

RUN apt-get update && apt-get upgrade -y && apt-get install -y curl
RUN curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/master/get-poetry.py | python -
RUN poetry config virtualenvs.create false

WORKDIR /app
COPY pyproject.toml poetry.lock ./
RUN poetry install
COPY . .
ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["api"]
