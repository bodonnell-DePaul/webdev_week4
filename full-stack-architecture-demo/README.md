# Full-Stack Architecture Demo

This runnable sample is a compact course project planner. It demonstrates how Weeks 1-4 fit together as one architecture:

- Browser foundation: HTML, CSS, JavaScript.
- React: components, form state, derived UI, reducer-based state transitions.
- Axios: a configured frontend HTTP client and resource-specific API functions.
- REST API: resource-oriented endpoints, JSON, status codes, CORS, validation errors.
- Persistence: ASP.NET Core, Entity Framework Core, SQLite, relationships, and seed data.
- Architecture thinking: durable state, UI state, API boundaries, constraints, and cache invalidation.

## React to Backend Connection

The demo intentionally keeps React and the API as separate local processes so students can see the boundary clearly.

```text
Browser loads React from Vite
  http://localhost:5173 or http://127.0.0.1:5173

React calls the API through Axios
  http://localhost:5000/api/projects
  http://localhost:5000/api/summary

ASP.NET Core validates requests and calls EF Core

EF Core reads or writes SQLite records
```

Use [src/App.jsx](src/App.jsx) to show these frontend concepts:

- The API base URL is centralized in [src/api/client.js](src/api/client.js).
- [src/api/projectsApi.js](src/api/projectsApi.js) gives components named operations instead of raw URLs.
- The reducer tracks server state, selected UI state, loading, and errors.
- Form drafts stay in React state until a submit sends JSON to the backend.
- After a successful write, the app reloads server state so the UI reflects the database.

Use [api/Program.cs](api/Program.cs) to show the matching backend concepts:

- CORS allows the local React origin to call the API.
- Request bodies are bound to C# request DTOs and validated before EF Core writes to SQLite.
- Endpoints return JSON resources rather than exposing database implementation details.
- Writes clear the cached summary so future reads are fresh.

## Architecture

```text
React UI on Vite (http://localhost:5173)
  uses Axios and owns temporary interaction state

ASP.NET Core API (http://localhost:5000/api)
  validates requests, returns resource-shaped responses, hides database details

Entity Framework Core DbContext
  maps application operations to durable database records

SQLite database
  stores projects, features, and design decisions
```

## Run It

```bash
cd week04/samples/full-stack-architecture-demo
npm install
npm run dev
```

Open the Vite URL shown in the terminal, usually `http://127.0.0.1:5173`.

## What to Demonstrate in Class

1. Inspect the entity classes and `AppDbContext` in [api/Program.cs](api/Program.cs) as design artifacts.
2. Inspect the Axios client boundary in [src/api/client.js](src/api/client.js) and [src/api/projectsApi.js](src/api/projectsApi.js).
3. Run the app and identify which values are UI state versus durable state.
4. Add a feature from the React form.
5. Refresh the page and show that the feature persisted.
6. Add a design decision and connect it to the project.
7. Send an invalid request and inspect the validation response.
8. Ask AI to propose an EF Core model or API-contract change, then review it using `../db-antipatterns.md`.

## API Resources

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Check that the API is running |
| `GET` | `/api/projects` | Load projects with features and decisions |
| `POST` | `/api/projects` | Create a new project |
| `POST` | `/api/projects/:projectId/features` | Add a feature to a project |
| `PATCH` | `/api/features/:id/status` | Update one feature's status |
| `POST` | `/api/projects/:projectId/decisions` | Record a design decision |
| `GET` | `/api/summary` | Return a cached architecture summary |

## Teaching Notes

The app is intentionally small. The point is not that every production app should use exactly these files or patterns. The point is to make the architectural boundaries visible enough that students can ask better questions of AI-generated implementations.