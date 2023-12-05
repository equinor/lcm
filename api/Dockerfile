FROM python:3.10-slim

ENV PYTHONUNBUFFERED=1
ENV FLASK_APP=/app/src/app.py
ENV PYTHONPATH=/app/src
ENV PATH="/app/.venv/bin:${PATH}"

RUN pip install --upgrade pip && \
    pip install poetry && \
    poetry config virtualenvs.in-project true

# Needed for html => pdf conversion
RUN apt-get update && apt-get install -y \
    pandoc \
    texlive-latex-base \
    texlive-fonts-extra \
    texlive-fonts-recommended \
    texlive-latex-extra


WORKDIR /app
RUN chown -R 1000:1000 /app
COPY pyproject.toml poetry.lock ./
RUN poetry install
COPY . .
USER 1000:1000
ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["api"]
