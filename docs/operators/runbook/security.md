# Security Management

## Security Incidents

> _Describe how information security incidents are handled._

Security Incidents should be reported at [Equinor's Computer Security Incident Response Team](https://www.equinor.com/about-us/csirt) as soon as identified.

## Security Checks

> _Security checks done every quarter._

| When     | Who                | Status |
|----------|--------------------|--------|
| Q1 xxxx  | username, username | OK     |

Tasks to perform:

* Update passwords and certificates where applicable (Key Vault secrets).
* Review users and admin access in:
  * App registration and Enterprise application (roles and assignments).
  * Azure subscription role assignments (Owners/Contributors).
  * GitHub repository teams and collaborators.
  * Radix `Team Hermes Radix Admin` group membership.

## Monitoring Vulnerabilities

> _Identifying, review and apply security patches._

We use [GitHub Advanced Security][ghas] for:

* **Dependency Scanning (SCA)**: Detects and updates vulnerable third-party dependencies via the Dependency Graph.
* **Code Scanning (SAST)**: Analyzes source code for security and quality issues using CodeQL before deployment.
* **Secret Scanning**: Alerts on exposed secrets in the codebase to prevent leaks.

[ghas]: https://docs.github.com/en/code-security/github-advanced-security