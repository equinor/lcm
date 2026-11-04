# =============================================================================
# Runtime base: Python + system packages needed at runtime (pandoc/LaTeX for PDF reports)
# =============================================================================
FROM python:3.14-slim AS base
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app/src
ENV FLASK_APP=/app/src/app.py
ENV PATH="/app/.venv/bin:${PATH}"
# Matplotlib needs a writable config dir when running as a user without a home directory
ENV MPLCONFIGDIR=/tmp/matplotlib

RUN apt-get update && apt-get install -y --no-install-recommends \
    pandoc \
    texlive-latex-base \
    texlive-latex-recommended \
    texlive-fonts-recommended \
    lmodern \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# =============================================================================
# Poetry: only used to resolve and install dependencies, never shipped in prod
# =============================================================================
FROM base AS poetry
ENV POETRY_NO_INTERACTION=1
ENV POETRY_VIRTUALENVS_IN_PROJECT=true
ENV POETRY_CACHE_DIR=/tmp/poetry-cache
RUN pip install --no-cache-dir "poetry~=2.2"
COPY pyproject.toml poetry.lock ./

FROM poetry AS deps
RUN poetry install --no-root --only main --compile && rm -rf "$POETRY_CACHE_DIR"

# =============================================================================
# Development / test image: includes dev dependencies (pytest, ruff, ...) and Poetry.
# Used by docker-compose and the test workflow.
# =============================================================================
FROM poetry AS dev
RUN poetry install --no-root --compile && rm -rf "$POETRY_CACHE_DIR"
COPY src ./src
RUN chown -R 1000:1000 /app
USER 1000:1000
# Flask dev server; auto-reloads when FLASK_DEBUG=true (set in docker-compose)
CMD ["flask", "run", "--host=0.0.0.0", "--port=5000"]

# =============================================================================
# Production image: runtime dependencies only
# =============================================================================
FROM base AS prod
COPY --from=deps /app/.venv /app/.venv
COPY src ./src
ARG GIT_COMMIT
ARG GIT_TAG
ENV GIT_COMMIT_HASH=${GIT_COMMIT} GIT_TAG=${GIT_TAG}
USER 1000:1000
CMD ["gunicorn", "src.app:app", \
     "--bind", "0.0.0.0:5000", \
     "--workers", "1", \
     "--timeout", "60", \
     "--worker-tmp-dir", "/dev/shm", \
     "--capture-output", \
     "--enable-stdio-inheritance", \
     "--access-logfile", "-", \
     "--log-file", "-", \
     "--no-control-socket"]
