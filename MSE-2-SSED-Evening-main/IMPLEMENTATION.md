# Docker implementation and verification

Student: Jitesh Kumar | Roll number: 202401100400103 | Section B | Branch CSE(AIML)

## How it works

- The frontend Dockerfile builds the React application with Node.js and copies only its `dist` directory into Nginx. Nginx serves the site on port 80 and forwards `/api/` and `/health` to the backend service.
- The backend Dockerfile installs production dependencies, includes the database schema, and runs as user ID 1000 on port 3000. On startup, it creates the required tables if they do not exist.
- Both Compose files connect four services to `taskflow_net`. PostgreSQL stores data in the `postgres_data` named volume. PostgreSQL and Redis have no host port mappings.
- PostgreSQL, Redis, and backend health checks control startup order. The backend uses the `postgres` and `redis` service names for internal connections.
- `docker-compose.yml` builds from source. `docker-compose.deploy.yml` pulls `jiteshhh001/frontend:latest` and `jiteshhh001/backend:latest` and has no frontend or backend build step or source mount.

## Local build and test

Copy `.env.example` to `.env`, then replace the password and JWT secret with strong private values. The `.env` file is ignored by Git.

```powershell
docker compose build
docker compose up -d --wait
$env:BASE_URL = 'http://localhost:8080'
$env:NODE_OPTIONS = '--experimental-vm-modules'
Set-Location tests
npm ci
npm test
Set-Location ..
./scripts/verify-local.ps1
```

The verification script checks the frontend proxy, backend health, service-name DNS, the custom network, PostgreSQL data after removing and recreating its container, and Redis after a restart. It does not remove the PostgreSQL volume.

## Docker Hub images and deployment

Published tags:

```text
jiteshhh001/frontend:v1
jiteshhh001/frontend:latest
jiteshhh001/backend:v1
jiteshhh001/backend:latest
```

With `.env` configured, deploy the published images without building source code:

```powershell
docker compose -f docker-compose.deploy.yml pull
docker compose -f docker-compose.deploy.yml up -d --wait --no-build
docker compose -f docker-compose.deploy.yml ps
Invoke-RestMethod http://localhost:8080/health
```

Open `http://localhost:8080` to register, log in, and manage tasks. The health response must report `ok` for the API, PostgreSQL, and Redis.

## GitHub Actions and submission

The `cd.yml` workflow runs on a push to `main`. It builds and publishes both images with `v1` and `latest` tags, pulls them into a temporary GitHub runner deployment, checks health, runs the API tests, verifies database persistence and Redis restart, and uploads container evidence. The runner deployment is temporary; use the deployment Compose file on the target machine for a lasting installation.

Repository Actions secrets required: `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`, and `POSTGRES_PASSWORD`. Keep tokens and passwords out of commits and the submitted PDF.

Pull request target: `atindeRR/MSE-2-SSED-Evening:main`.

Pull request title: `DOCKER-SET-2 | 202401100400103 | Jitesh Kumar | B`.

The evidence PDF is at `submission/final/202401100400103_JITESH_KUMAR_SET2.pdf` and is linked from pull request #14. It contains build, Docker Hub, deployment, workflow, and pull request results. Upload this PDF to Moodle.
