FROM python:3.8-slim

ENV PYTHONUNBUFFERED=1
ENV FLASK_APP=/app/app.py
ENV PYTHONPATH=/app
ENV PATH="/root/.poetry/bin:${PATH}"
ARG UID=3000

RUN useradd --system --uid $UID nonrootuser
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
COPY pyproject.toml poetry.lock ./
RUN poetry install
COPY . .
USER nonrootuser
ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["api"]
