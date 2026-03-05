# Developer Guide

Welcome to the LCM Optimizer developer guide. This section covers everything you need to get started contributing to the project.

## Contents

- [Setup](setup.md) — Installing prerequisites and configuring your development environment
- [Running](running.md) — How to build and run the application locally
- [Testing](testing.md) — Running tests, linting, and code quality tools
- [Upgrading](upgrading.md) — Keeping dependencies up to date

## Prerequisites

Before you begin, make sure you have the following tools installed:

### Required

| Tool | Purpose | Install guide |
|------|---------|---------------|
| [Docker](https://docs.docker.com/get-docker/) | Containerized builds and local development | [docs.docker.com](https://docs.docker.com/get-docker/) |
| [Docker Compose](https://docs.docker.com/compose/install/) | Multi-container orchestration | Included with Docker Desktop |
| [Git](https://git-scm.com/) | Version control | [git-scm.com](https://git-scm.com/downloads) |
| [pre-commit](https://pre-commit.com/) | Git hook manager for code quality checks | [pre-commit.com](https://pre-commit.com/#install) |

### Recommended (for working outside Docker)

| Tool | Version | Purpose |
|------|---------|---------|
| [Python](https://www.python.org/) | ≥ 3.12 | API development |
| [Poetry](https://python-poetry.org/) | ≥ 2.0 | Python dependency management |
| [Node.js](https://nodejs.org/) | ≥ 25.x | Frontend development |
| [npm](https://docs.npmjs.com/) | Bundled with Node.js | Frontend package management |

### Code quality tools

| Tool | Scope | Purpose |
|------|-------|---------|
| [Ruff](https://docs.astral.sh/ruff/) | API | Python linter |
| [Black](https://black.readthedocs.io/) | API | Python code formatter |
| [Bandit](https://bandit.readthedocs.io/) | API | Python security linter |
| [Biome](https://biomejs.dev/) | Web | TypeScript/JavaScript linter and formatter |

## Competence areas

To contribute effectively, familiarity with the following technologies is recommended:

- **Frontend**: React, TypeScript, Vite, styled-components, [Equinor EDS](https://eds.equinor.com/)
- **Backend**: Python, Flask, NumPy, Pandas, Matplotlib
- **Infrastructure**: Docker, Nginx, Radix, Azure
- **Authentication**: OAuth 2.0, JWT, Azure AD
- **Data**: Azure Table Storage, Azure Blob Storage, SharePoint
