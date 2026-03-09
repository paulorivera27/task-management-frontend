# Task Management Frontend

Welcome to the task manager APP front end repository, this is a React application that is meant for personal task management, it complements the backend repo and Features full CRUD for tasks, JWT authentication, status filtering, pagination, and internationalization, all communicating with a Rails GraphQL API.

This is the **frontend** repository. The backend lives at [task-management-api](https://github.com/paulorivera27/task-management-api).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Language | TypeScript 5.9 |
| Build Tool | Vite 7 |
| GraphQL Client | Apollo Client 4 |
| Routing | React Router 7 |
| Styling | styled-components 6 |
| i18n | i18next (English, Spanish, Japanese) |
| Linting | ESLint 9 |
| CI/CD | GitHub Actions (lint, typecheck, build, Docker) |
| Deploy | Docker (Node build + nginx server) |

---

## Quick Start with Docker Compose

Well, basically the backend repo is the one doing the lifting here mostly, the easiest way to run the full app is using the Docker Compose that is defined in the **backend** repository and orchestrates both services.

**Prerequisites:** Docker and Docker Compose installed.

**Both repos must be cloned side by side in the same parent directory:**

```
parent-directory/
├── task-management-api/          # backend repo
└── task-management-frontend/     # this repo
```

```bash
# 1. Clone both repos
git clone https://github.com/paulorivera27/task-management-api.git
git clone https://github.com/paulorivera27/task-management-frontend.git

# 2. Set up backend environment variables
cd task-management-api
cp .env.example .env

# 3. Build and start all services
docker compose up --build
```

Once the app is running:
- **Frontend:** http://localhost:3000
- **API endpoint:** http://localhost:4000/graphql

---

## Local Development Setup

To setup the app for development remembre to run the backend API at the following address: `http://localhost:4000/graphql`.

**Prerequisites:**
- Node.js 22
- npm

```bash
# 1. Clone and enter the repo
git clone https://github.com/paulorivera27/task-management-frontend.git
cd task-management-frontend

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env

# 4. Start the dev server
npm run dev
```

The app will be available at http://localhost:3000.

---

## Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:4000/graphql` | GraphQL API endpoint. Only needed for `npm run dev`. The Docker build uses a hardcoded default. |

---

## Available Scripts

```bash
# Start dev server on port 3000
npm run dev

# Type-check without emitting
npm run typecheck

# Lint with ESLint
npm run lint

# Production build
npm run build

# Preview production build locally
npm run preview
```

---

## Authentication Flow

1. User signs up or signs in via the login page
2. The backend returns a JWT token
3. Token is stored in `localStorage`
4. Apollo Client attaches the token as `Authorization: Bearer <token>` on every GraphQL request via an auth link
5. Protected routes redirect to login if no token is present
6. Logout clears the token and resets the Apollo cache

---

## CI/CD

GitHub Actions runs on every push and pull request to `master`:

| Job | What it does |
|-----|-------------|
| `lint-and-typecheck` | ESLint + TypeScript type checking |
| `build` | Production build (`tsc -b && vite build`) |
| `docker` | Builds the Docker image |

---
