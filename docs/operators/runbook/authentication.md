# Authentication

This document describes the authentication and authorization flow used by the LCM Optimizer.

## Auth Architecture Overview

```mermaid
flowchart TB
    subgraph Users["👤 Users"]
        Browser["Web Browser"]
    end

    subgraph Infrastructure["Infrastructure Layer"]
        NGINX["NGINX Proxy<br/>(port 8080)<br/>auth_request /oauth2/auth"]
        Redis["Redis Session Store<br/>cookie_refresh: 15m<br/>cookie_expire: 1h"]
    end

    subgraph Frontend["Frontend Layer"]
        Web["React/Vite Web App<br/>Session expiry detection<br/>Cross-tab re-auth support"]
        OAuth2Proxy["OAuth2 Proxy<br/>PKCE: S256<br/>Allowed: equinor.com"]
    end

    subgraph Backend["Backend Layer"]
        API["Flask Backend<br/>JWT: RS256<br/>JWKS Cache: 24h"]
        ABAC["ABAC Engine<br/>Role-based permissions"]
    end

    subgraph EntraID["Microsoft Entra ID<br/>(Equinor Tenant)"]
        JWKS["JWKS Endpoint<br/>Token Signing Keys"]

        OAuthApp["lcm-oauth2-{env}<br/>User Authentication"]
        APIApp["lcm-api-{env}<br/>Backend Identity<br/>Exposes: /access scope"]

        subgraph Roles["App Roles"]
            RoleReader["Default<br/>Read/sync access"]
        end
    end

    subgraph CICD["CI/CD"]
        GitHub["GitHub Actions<br/>Federated Identity"]
        KeyVault["Azure Key Vault<br/>lcm-{env}-vault"]
    end

    Browser -->|"1. Request"| NGINX
    NGINX -->|"2. auth_request"| OAuth2Proxy
    OAuth2Proxy <-->|"Session storage"| Redis
    OAuth2Proxy -->|"3. OIDC Login<br/>Scopes: openid profile<br/>email offline_access<br/>api/access"| OAuthApp
    OAuthApp -->|"Requests permission"| APIApp

    NGINX -->|"4. Forward with headers<br/>Authorization: Bearer id_token<br/>X-Forwarded-Access-Token"| API
    API -->|"5. Validate JWT"| JWKS

    GitHub -->|"Workload Identity Federation"| EntraID
    KeyVault -->|"Secrets"| OAuth2Proxy
    KeyVault -->|"Secrets"| API

    style EntraID fill:#0078d4,color:#fff
    style Roles fill:#ffd700,color:#000
    style CICD fill:#238636,color:#fff
```

## BFF Authentication Pattern

The BFF (Backend-for-Frontend) pattern places a server-side component between the browser and backend API to handle authentication. In this implementation:

- **OAuth2-Proxy** manages authentication sessions and token handling
- **NGINX** acts as the entry point, enforcing auth via `auth_request`
- **Redis** stores encrypted session data
- **Frontend** uses cookie-based sessions (no tokens in JavaScript)

```mermaid
flowchart LR
    subgraph Browser
        SPA["React SPA"]
    end

    subgraph BFF["BFF Layer"]
        NGINX["NGINX<br/>:8080"]
        OAuth2["OAuth2-Proxy<br/>:8081"]
        Redis["Redis<br/>Session Store"]
    end

    subgraph Backend
        API["API Server<br/>:5000"]
    end

    subgraph IdP["Identity Provider"]
        EntraID["Microsoft Entra ID"]
    end

    SPA -->|"1. Request /api/*"| NGINX
    NGINX -->|"2. auth_request"| OAuth2
    OAuth2 <-->|"Session lookup"| Redis
    OAuth2 -->|"3. Validate/Refresh"| EntraID
    NGINX -->|"4. Forward + tokens"| API
    API -->|"5. Response"| NGINX
    NGINX -->|"6. Response"| SPA
```

### Authentication Flow

The following sequence diagram shows the step-by-step authentication flow when a user accesses the application:

```mermaid
sequenceDiagram
    participant Browser
    participant NGINX
    participant OAuth2-Proxy
    participant Redis
    participant EntraID as Microsoft Entra ID
    participant API

    Browser->>NGINX: GET /api/data
    NGINX->>OAuth2-Proxy: auth_request /oauth2/auth
    OAuth2-Proxy->>Redis: Lookup session cookie

    alt No valid session
        OAuth2-Proxy-->>NGINX: 401 Unauthorized
        NGINX-->>Browser: Redirect to /oauth2/sign_in
        Browser->>OAuth2-Proxy: GET /oauth2/sign_in
        OAuth2-Proxy-->>Browser: Redirect to Entra ID
        Browser->>EntraID: Authorization request (PKCE)
        EntraID-->>Browser: Redirect with authorization code
        Browser->>OAuth2-Proxy: GET /oauth2/callback?code=...
        OAuth2-Proxy->>EntraID: Exchange code for tokens
        EntraID-->>OAuth2-Proxy: Access + ID + Refresh tokens
        OAuth2-Proxy->>Redis: Store encrypted session
        OAuth2-Proxy-->>Browser: Set cookie, redirect to original URL
    end

    alt Valid session
        OAuth2-Proxy-->>NGINX: 200 OK + token headers
        NGINX->>API: Forward request with<br/>Authorization: Bearer id_token<br/>X-Forwarded-Access-Token: access_token
        API->>EntraID: Validate JWT via JWKS
        API-->>NGINX: Response
        NGINX-->>Browser: Response
    end
```

## Security Benefits

| Feature                     | Implementation                         | Benefit                                  |
|-----------------------------|----------------------------------------|------------------------------------------|
| **No tokens in browser JS** | OAuth2-Proxy stores tokens server-side | Prevents XSS token theft                 |
| **HttpOnly cookies**        | `cookie_httponly = true`               | JavaScript cannot access session cookie  |
| **Secure cookies**          | `cookie_secure = true`                 | Cookies only sent over HTTPS             |
| **SameSite cookies**        | `cookie_samesite = "lax"`              | CSRF protection                          |
| **Encrypted sessions**      | `OAUTH2_PROXY_COOKIE_SECRET`           | Session data encrypted at rest in Redis  |
| **Automatic token refresh** | `cookie_refresh = "15m"`               | Tokens refreshed before expiry           |
| **PKCE**                    | `code_challenge_method: S256`          | Prevents authorization code interception |
| **API 401 responses**       | `api_routes = ["^/api/.*"]`            | APIs return 401, not redirect            |
| **JWT validation**          | RS256 + JWKS                           | Cryptographic token verification         |
| **24h JWKS cache**          | `TTLCache(ttl=86400)`                  | Performance with security                |

## Azure AD App Registration

The application has a single App Registration in Azure AD:

| Property | Value |
|----------|-------|
| **App ID (Client ID)** | `1dbc1e96-268d-41ad-894a-92a9fb85f954` |
| **Tenant ID** | `3aa4a235-b6e2-48d5-9195-7fcf05b459b0` |
| **API Identifier URI** | `api://lost-circulation-material-api` |

### App Registration links

- [App Registration in Azure Portal](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/Overview/appId/1dbc1e96-268d-41ad-894a-92a9fb85f954/isMSAApp~/false)
- [Enterprise Application](https://portal.azure.com/#view/Microsoft_AAD_IAM/ManagedAppMenuBlade/~/Overview/objectId/e8f33fc2-ed9d-42ba-a8e1-44951d111671/appId/1dbc1e96-268d-41ad-894a-92a9fb85f954)


### Managing user access

To manage who can access the application, you need to be added as an owner to the [Enterprise Application](https://portal.azure.com/#view/Microsoft_AAD_IAM/ManagedAppMenuBlade/~/Overview/objectId/e8f33fc2-ed9d-42ba-a8e1-44951d111671/appId/1dbc1e96-268d-41ad-894a-92a9fb85f954).

## Permissions required

| Action | Requirement |
|--------|-------------|
| Managing user access | Owner of the Enterprise Application |
| Managing App Registration | Owner of the Azure App Registration |
| Managing Radix | Member of the `Radix Platform Users` groups (via AccessIT) + member of the [Team Hermes Radix Admin](https://portal.azure.com/#view/Microsoft_AAD_IAM/GroupDetailsMenuBlade/~/Overview/groupId/13b319d8-ee25-4b6b-97db-74bad07d2057) group |
