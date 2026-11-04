# Upgrading packages

## Web dependencies

The frontend uses **npm** for dependency management.

### Update all packages

```sh
cd web
npm update
```

### Update a specific package

```sh
cd web
npm update <package-name>
```

### Check for outdated packages

```sh
cd web
npm outdated
```



## API dependencies

The API uses **uv** for dependency management. The configuration is in `api/pyproject.toml`.

### Update all packages

```sh
cd api
uv lock --upgrade
uv sync
```

### Update a specific package

```sh
cd api
uv lock --upgrade-package <package-name>
uv sync
```

### Check for outdated packages

```sh
cd api
uv tree --outdated --depth 1
```

### Add a new dependency

```sh
cd api
# Runtime dependency
uv add <package-name>

# Development-only dependency
uv add --dev <package-name>
```
