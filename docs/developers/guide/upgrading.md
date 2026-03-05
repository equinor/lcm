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

The API uses **Poetry** for dependency management. The configuration is in `api/pyproject.toml`.

### Update all packages

```sh
cd api
poetry update
```

### Update a specific package

```sh
cd api
poetry update <package-name>
```

### Check for outdated packages

```sh
cd api
poetry show --outdated
```

### Add a new dependency

```sh
cd api
# Runtime dependency
poetry add <package-name>

# Development-only dependency
poetry add --group dev <package-name>
```
