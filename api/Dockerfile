FROM python:3.8-slim

ENV PYTHONUNBUFFERED=1
ENV FLASK_APP=/code/app.py
ENV PYTHONPATH=/code

RUN pip install poetry

WORKDIR /code
COPY pyproject.toml poetry.lock ./
RUN poetry update
RUN poetry export -f requirements.txt --dev | pip install -r /dev/stdin
COPY . .

ENTRYPOINT ["/code/docker-entrypoint.sh"]

CMD ["api"]
