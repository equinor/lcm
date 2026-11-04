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
# uv: only used to resolve and install dependencies, never shipped in prod
# =============================================================================
FROM base AS uv
COPY --from=ghcr.io/astral-sh/uv:0.13.7 /uv /uvx /bin/
ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy
# Use the base image's Python so the venv copied into prod points at an interpreter that exists there
ENV UV_PYTHON_PREFERENCE=only-system
ENV UV_PYTHON_DOWNLOADS=never
COPY pyproject.toml uv.lock ./

FROM uv AS deps
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --locked --no-install-project --no-dev

# =============================================================================
# Development / test image: includes dev dependencies (pytest, ruff, ...) and uv.
# Used by docker-compose and the test workflow.
# =============================================================================
FROM uv AS dev
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --locked --no-install-project
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
