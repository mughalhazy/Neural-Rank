# Security Policy

## Supported versions

Only the latest commit on `main` is actively supported.

## Reporting a vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Report by email: mughalhazy@gmail.com

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (optional)

We will acknowledge within 48 hours and aim to resolve critical issues within 14 days.

## Scope

**In scope:**
- Backend API at `https://neural-rank-backend.onrender.com`
- Authentication and authorization logic (`backend/src/api/auth.js`)
- Database schema and row-level access patterns (`supabase/migrations/`)
- Governance engine and action classification (`backend/src/domains/governance/`)
- Credential handling and environment variable exposure

**Out of scope:**
- Render platform infrastructure
- Supabase platform infrastructure
- Third-party SERP provider APIs (SerpApi, DataForSEO)
