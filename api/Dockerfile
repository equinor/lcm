FROM python:3.8-slim

ENV PYTHONUNBUFFERED=1
ENV FLASK_APP=/app/app.py
ENV PYTHONPATH=/app
ENV PATH="/root/.poetry/bin:${PATH}"


RUN apt-get update && apt-get upgrade -y && apt-get install -y curl
RUN curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/master/get-poetry.py | python -
RUN poetry config virtualenvs.create false

# Needed for html => pdf conversion
RUN apt-get update && apt-get install -y \
    pandoc \
    texlive-latex-base \
    texlive-fonts-extra \
    texlive-fonts-recommended \
    texlive-latex-extra \
    wkhtmltopdf

WORKDIR /app
RUN chown -R 1000:1000 /app
COPY pyproject.toml poetry.lock ./
RUN poetry install
COPY ./calculators ./calculators
COPY ./controllers ./controllers
COPY ./classes ./classes
COPY ./openapi ./openapi
COPY ./plots ./plots
COPY ./test_data ./test_data
COPY ./tests ./tests
COPY ./util ./util
COPY __init__.py app.py config.py docker-entrypoint.sh ./
USER 1000:1000
ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["api"]
