# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| latest  | :white_check_mark: |

## Known Security Issues

### esbuild Development Server Vulnerability (GHSA-67mh-4wv8-2f99)

**Status**: Acknowledged, mitigation in place

**Severity**: Moderate (CVSS 5.3)

**Description**: esbuild versions <=0.24.2 may allow any website to send requests to the development server and read the response.

**Impact**: 
- **Development only** - does not affect production builds
- Requires attacker to have network access to the development server
- Requires user interaction (visiting malicious website while dev server is running)
- Does not affect deployed applications

**Mitigation**:
1. Only run development server on trusted networks
2. Use firewall rules to restrict access to development server
3. Never run development server on public networks
4. Production builds are NOT affected

**Why Not Fixed**:
The fix requires upgrading to Vite 7.x, which is a major breaking change. This is planned for a future release after thorough testing and migration planning.

## Reporting a Vulnerability

If you discover a security vulnerability, please email the maintainers or open a private security advisory on GitHub.
