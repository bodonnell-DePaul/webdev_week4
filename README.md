# Week 4: Persistence, Data Design, and Application State

**CSC 436 - Web Applications - DePaul University**

---

## Teaching Frame

Weeks 1-3 gave students the foundations for building an interactive web application:

- Week 1: HTML, CSS, JavaScript, tooling, and the AI-assisted development loop.
- Week 2: React components, props, state, and client-side architecture.
- Week 3: HTTP, REST, APIs, request pipelines, CORS, and backend services.

Week 4 adds the idea that web applications need durable memory. Up to this point, an app can respond to users and update the screen, but its knowledge disappears when the page refreshes or the server restarts. Persistence changes the architecture. The application now has to protect data, model relationships, preserve history, handle concurrent use, and treat the database as a long-lived part of the system rather than a temporary variable in memory.

The central message for students:

> AI can generate database code quickly, but developers must design the data model, understand the system boundaries, and review the generated implementation against architectural constraints.

---

## The Big Shift: From Temporary State to Durable State

In early web apps, students often keep data in arrays, component state, or simple variables on the server. That is useful for learning, but it has architectural limits.

Temporary state answers questions like:

- What is the user typing into this form right now?
- Which tab is selected?
- Is the cart drawer open?
- What data did this component fetch for the current page?

Durable state answers different questions:

- What products, projects, users, or orders exist in the system?
- Who owns each record?
- Which records are related to each other?
- What must remain true even if a request fails halfway through?
- What data must still exist tomorrow?

The design problem is deciding where each kind of state belongs.

| Kind of state | Typical home | Design question |
| --- | --- | --- |
| UI state | React component state or reducer | Does this only affect the current screen? |
| Shared client state | React Context, reducer, or a state library | Do many components need the same current value? |
| Server state | API responses cached by the client | Did this come from another system of record? |
| Durable domain state | Database | Must this survive reloads, restarts, and multiple users? |

Students should learn to ask: "If this value disappeared, would the application lose user work, business history, or system integrity?" If yes, it probably belongs in persistent storage.

---

## Full-Stack Architecture With Persistence

A persisted web application has several cooperating layers:

```text
Browser UI
  React components, forms, local state, client-side validation

HTTP API
  REST resources, status codes, request validation, authentication boundary

Application logic
  Business rules, transactions, permissions, workflow decisions

Persistence layer
  ORM or query layer, migrations, database connection management

Database
  Tables/documents, relationships, constraints, indexes, stored durable state
```

Each layer has a different responsibility.

The browser should make the experience usable. It can prevent obvious mistakes and keep the interface responsive, but it cannot be trusted as the final authority because users can bypass it.

The API should define the contract between frontend and backend. It should use resource-oriented URLs, predictable status codes, and clear JSON shapes. This connects directly to Week 3.

Application logic should protect the rules of the domain. For example: an order cannot contain a negative quantity; a project feature cannot belong to a project that does not exist; a user should not edit someone else's data.

The persistence layer translates application decisions into durable database operations. It should use one database client or connection pool, avoid query patterns that scale poorly, and treat migrations as versioned changes to the system.

The database is the last line of defense for integrity. It should enforce uniqueness, required fields, foreign keys, and indexes where the application depends on them.

---

## Data Modeling as Design Work

Data modeling is not just creating tables. It is deciding what the application believes exists in the world.

When students ask AI for a schema, they should first describe the domain in plain English:

- What are the main nouns in the app?
- Which nouns are independent entities and which are details of another entity?
- What can happen to each entity over time?
- What relationships must always be true?
- What questions will the app need to answer quickly?

Example domain statement:

> A course project planner lets a team track projects, features, and design decisions. A project has many features. A project has many decisions. Each feature belongs to exactly one project and has a layer, priority, and status. The app needs to show the current project plan and summarize work by layer and status.

That statement already implies much of the architecture:

- `Project` is a durable entity.
- `Feature` is a durable entity related to a project.
- `Decision` is a durable record of design thinking.
- `layer`, `priority`, and `status` should be constrained values rather than arbitrary text.
- The API should support reading a project with its related features and decisions.
- The UI should distinguish between server data and local form state.

### Entity Relationship Thinking

Common relationship patterns:

| Relationship | Example | Design meaning |
| --- | --- | --- |
| One-to-one | User and profile | One record extends another record |
| One-to-many | Project and features | One parent owns or groups many children |
| Many-to-many | Products and tags | Each side can connect to many records on the other side |

Students should be cautious when AI stores repeated information in a single text field. Values like `"frontend,api,database"` look simple but make searching, filtering, validation, and relationships harder. If the application needs to ask questions about the individual values, those values probably deserve structure.

### Constraints Are Part of the Design

Constraints are not busywork. They are the rules the database promises to enforce.

Useful constraints include:

- Required fields for data the app cannot function without.
- Unique fields for identities such as email, username, slug, or SKU.
- Foreign keys for relationships between records.
- Enumerated values for states such as status, role, priority, or workflow stage.
- Cascade rules for deciding what happens to child records when a parent is deleted.

AI often produces a schema that looks plausible but omits constraints. The result may work in a demo and fail as soon as real users create messy data.

---

## Choosing a Persistence Technology

The course uses SQLite first because it keeps setup simple and lets students focus on modeling and architecture. SQLite stores data in a local file and works well for development, class demos, automated tests, and small single-user tools.

Production systems often use PostgreSQL because it handles multiple users, concurrent writes, richer data types, stronger operational tooling, and managed cloud hosting. PostgreSQL is usually the default relational database choice for serious web applications.

Document databases such as MongoDB are useful when records are naturally document-shaped and the structure varies significantly. They are not a shortcut around data design. If the app has clear relationships, transactions, and integrity requirements, a relational model is often easier to reason about.

The practical rule for students:

> Default to a relational database when the app has clear entities, relationships, and business rules. Choose another storage model only when the access patterns justify it.

---

## ORMs, Entity Framework Core, and the Role of the Model

An ORM is a boundary between application code and the database. It lets developers work with language-level objects while still relying on a database underneath.

Entity Framework Core is the ORM for the ASP.NET Core backend in this course. It fits naturally with the .NET stack students used in Week 3: C# classes represent domain entities, a `DbContext` represents a database session and unit of work, and LINQ queries describe what data the backend needs.

With EF Core, the model is communicated through:

- C# entity classes such as `Project`, `Feature`, `User`, or `Order`.
- A `DbContext` class with `DbSet<T>` properties for durable collections.
- Data annotations or Fluent API configuration for required fields, relationships, indexes, and delete behavior.
- EF Core migrations that describe how the database changes over time.

Students do not need to memorize every EF Core method. They do need to understand what the entity model means, how relationships are represented, and whether generated code matches the domain.

### EF Core Mental Model

An ASP.NET Core API using EF Core usually has these pieces:

```text
Entity classes
  C# classes that represent durable domain records

DbContext
  The EF Core gateway to the database and tracked changes

LINQ queries
  C# expressions that EF Core translates into SQL

Migrations
  Versioned database schema changes generated from model changes

Database provider
  SQLite for local development, SQL Server or PostgreSQL for production
```

Example shape, conceptually:

```csharp
public class Project
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Problem { get; set; }
    public List<Feature> Features { get; set; } = [];
}

public class AppDbContext : DbContext
{
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<Feature> Features => Set<Feature>();
}
```

The code is not important because of the syntax. It is important because it reveals the architecture: projects are durable records, features are related records, and the backend has a structured persistence boundary.

### Migrations as Versioned Architecture

A migration is a versioned change to the database structure. It is similar to a commit in source control: it describes how the system moves from one shape to another.

Important migration habits:

- Treat migrations as history, not scratch paper.
- Do not edit migrations that have already been shared or applied elsewhere.
- Give migrations meaningful names that describe the design change.
- Keep seed data separate from schema changes.
- Test the application from a fresh database, not only from a database that already happens to work on your machine.

Common EF Core commands:

```bash
dotnet ef migrations add InitialCreate
dotnet ef database update
dotnet ef migrations add AddFeatureStatus
dotnet ef database update
```

The key idea is not the command syntax. The key idea is that model changes and database changes must move together.

---

## API Design After Adding a Database

Week 3 introduced REST as a resource-oriented contract. Week 4 adds a database behind that contract, which creates new design responsibilities.

An API endpoint should not simply expose tables. It should expose useful application resources.

Example resource design:

| User goal | API shape | Architectural idea |
| --- | --- | --- |
| See all projects | `GET /api/projects` | Read server state through a collection resource |
| Add a feature to a project | `POST /api/projects/:projectId/features` | Create a child resource under a parent |
| Change feature status | `PATCH /api/features/:id/status` | Modify one part of a resource |
| Record a design decision | `POST /api/projects/:projectId/decisions` | Preserve architecture history |

Good API design keeps the frontend independent from database details. The frontend should not need to know table names, join structure, or migration history. It should know the API contract.

### Status Codes Still Matter

Database-backed APIs need clear outcomes:

- `200 OK` for successful reads and updates.
- `201 Created` when a new resource is created.
- `204 No Content` when deletion succeeds and there is no body to return.
- `400 Bad Request` when the client sends invalid data.
- `404 Not Found` when the requested resource does not exist.
- `409 Conflict` when the request violates a uniqueness or state rule.
- `500 Internal Server Error` for unexpected server failures.

Students should read AI-generated endpoints and ask: "What does this endpoint promise, and how does the client know what happened?"

---

## Connecting React to the Backend API

Weeks 2 and 3 introduced the two halves of a full-stack app: React renders the user interface, and the backend exposes resources over HTTP. Week 4 connects those halves to durable data.

The important architectural idea is that React does not talk to the database. React talks to the API. The API talks to the database. That boundary keeps the frontend focused on user workflows and keeps persistence rules on the server.

```text
React component
  owns UI state and calls an API helper

API helper
  sends HTTP requests and normalizes loading/error behavior

ASP.NET Core endpoint
  validates the request and applies business rules

EF Core DbContext
  reads or writes durable data

Database
  enforces relationships and constraints
```

### Development Topology

In development, the frontend and backend usually run as two separate processes:

| Process | Example URL | Responsibility |
| --- | --- | --- |
| React dev server | `http://localhost:5173` | Serves the UI, supports hot reload, proxies or calls APIs |
| ASP.NET Core API | `http://localhost:5000` or `https://localhost:7000` | Handles HTTP resources, validation, persistence, and errors |
| Database | Local SQLite file or database server | Stores durable state |

Because the frontend and backend run on different origins, the browser enforces CORS. This is not a React problem and not a database problem. It is a browser security rule: JavaScript loaded from one origin cannot freely call another origin unless the backend allows it.

Students should understand this common debugging pattern:

- If the request works in Postman or curl but fails in the browser, suspect CORS.
- If the browser says `Failed to fetch`, check whether the API is running and whether CORS allows the frontend origin.
- If the response is `400`, `404`, or `500`, the request reached the API and should be debugged as an API contract or server problem.

### The Frontend Should Depend on an API Contract

React components should not be designed around database tables. They should be designed around user tasks and API response shapes.

For example, a project dashboard screen probably wants one response that already contains:

- The selected project.
- Its features grouped or labeled by layer.
- Recent design decisions.
- Summary counts for the dashboard.

The database may store that information in several tables, but the component should not have to know the join strategy. The backend can shape the JSON response for the screen while keeping database details private.

This is the design distinction:

| Concern | Frontend question | Backend question |
| --- | --- | --- |
| Resource shape | What data does this screen need? | What query or aggregation produces that shape? |
| Validation | How do we help the user fix input? | What input must be rejected before persistence? |
| Error handling | What should the user see? | Which status code and JSON error should be returned? |
| State ownership | Is this local interaction or saved domain data? | Is this request allowed to change durable state? |

### Why Use Axios Instead of JavaScript Fetch?

JavaScript has a built-in `fetch` API, and it is perfectly capable for simple requests. In class projects, Axios is often a better teaching and development tool because it gives students a cleaner API boundary and fewer repetitive details.

Axios advantages:

- It automatically parses JSON responses.
- It treats non-2xx HTTP status codes as errors, which makes error handling more consistent.
- It lets you create a configured API client with a shared `baseURL`.
- It supports request and response interceptors for auth headers, logging, and centralized error handling.
- It has convenient helpers such as `axios.get`, `axios.post`, `axios.patch`, and `axios.delete`.
- It handles request bodies and headers with less repeated boilerplate.

The important teaching point is not that `fetch` is bad. The point is that a real frontend should have an organized HTTP client layer. Axios makes that layer easier for students to see.

| Concern | `fetch` default | Axios default |
| --- | --- | --- |
| JSON parsing | Must call `response.json()` | Response data is available on `response.data` |
| Error status handling | `404` and `500` do not throw automatically | Non-2xx responses reject the promise |
| Base URL | Usually repeated or manually wrapped | Built into an Axios instance |
| Shared behavior | Custom wrapper required | Interceptors are built in |
| Teaching clarity | More low-level browser API details | Cleaner service-layer examples |

### Where Axios Belongs in a React App

Axios should not be scattered directly through every component. Put it behind a small API layer so components talk to application concepts instead of HTTP mechanics.

Recommended structure:

```text
src/
  api/
    client.js          shared Axios instance
    projectsApi.js     project-specific API functions
  components/
  App.jsx
```

`client.js` creates the configured HTTP client:

```javascript
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});
```

`projectsApi.js` gives the rest of the app named operations:

```javascript
import { apiClient } from './client';

export async function getProjects() {
  const response = await apiClient.get('/projects');
  return response.data;
}

export async function createFeature(projectId, feature) {
  const response = await apiClient.post(`/projects/${projectId}/features`, feature);
  return response.data;
}

export async function updateFeatureStatus(featureId, status) {
  const response = await apiClient.patch(`/features/${featureId}/status`, { status });
  return response.data;
}
```

Then React components call domain-specific functions:

```javascript
useEffect(() => {
  async function loadProjects() {
    try {
      setLoading(true);
      setProjects(await getProjects());
    } catch (error) {
      setError(error.response?.data?.message || 'Unable to load projects');
    } finally {
      setLoading(false);
    }
  }

  loadProjects();
}, []);
```

This keeps components focused on UI state: loading, error, selected project, form draft, and display. The API layer owns HTTP details: base URLs, endpoints, methods, and response parsing.

### Fetching Data in React With Axios

When React gets data from an API, the component has to represent more than just the data. It also has to represent the state of the request.

Every API-backed screen needs answers to these questions:

- What should the user see while the request is loading?
- What should happen if the request fails?
- What should happen if the API returns an empty list?
- How should the screen refresh after a successful create, update, or delete?
- Should the UI wait for the server, or show an optimistic change first?

The common pattern is:

1. Component renders with initial loading state.
2. Component calls an API helper after it appears on screen.
3. API helper sends a request to the backend.
4. Backend validates, queries the database, and returns JSON.
5. Component stores the returned server state and renders it.
6. If the user changes durable data, the frontend sends a mutation request and then refreshes or reconciles server state.

Students do not need to memorize a single perfect implementation pattern. They do need to recognize that API calls are asynchronous and can fail. AI-generated React code often forgets loading states, error states, empty states, or refresh behavior after writes.

### Sending Form Data to the ASP.NET Core Backend

Forms are where temporary UI state becomes durable state.

Before submit:

- The user is editing local React state.
- The database has not changed.
- The app can provide immediate client-side feedback.

On submit:

- React sends JSON to the ASP.NET Core API with Axios.
- The API binds the JSON body to a C# request DTO.
- The API validates the request body.
- Application logic decides whether the operation is allowed.
- EF Core writes the accepted change to the database.
- The API returns either a success response or a structured error.

After submit:

- The frontend clears or preserves the form depending on the outcome.
- The frontend refreshes the affected server state.
- The user sees either the saved result or a useful error.

This is why validation appears in multiple places. Client validation helps the user. Server validation protects the system. Database constraints protect the data if application code misses something.

### Environment and Configuration

React code needs to know where the API lives. Hard-coding an API URL can work in a small demo, but students should understand that the value changes by environment.

| Environment | Frontend API target |
| --- | --- |
| Local development | `http://localhost:5000/api` or `https://localhost:7000/api` |
| Deployed frontend and API together | Often a relative path such as `/api` |
| Deployed separately | A configured public API URL |

The architectural principle is simple: configuration should change between environments without rewriting components. The React app should have one Axios client and one API layer rather than scattered HTTP calls with repeated URLs throughout the component tree.

### Common AI Mistakes When Connecting React and APIs

When students use AI to connect the frontend to the backend, they should watch for:

- Axios calls copied into many components instead of organized behind a small API helper.
- Components that assume the API always succeeds.
- No loading, empty, or error states.
- Form submissions that do not refresh the saved server state.
- Frontend code that sends fields the API does not accept.
- Backend code that returns a shape different from what the frontend expects.
- CORS fixes attempted in React instead of on the server.
- Secrets or database connection strings placed in frontend code.

The final point is critical: anything bundled into React is visible to users. A React app can contain a public API base URL. It must not contain database credentials, private API keys, or server secrets.

### How the Demo Shows This Connection

The runnable Week 4 demo uses this flow:

1. Vite serves the React UI.
2. The frontend API layer uses Axios to load projects and summary data from ASP.NET Core.
3. ASP.NET Core returns project-shaped JSON that includes related features and decisions.
4. React keeps form drafts and selected project ID as UI state.
5. When a feature or decision is submitted, React sends JSON to the API with Axios.
6. ASP.NET Core binds and validates the request DTO.
7. EF Core writes the accepted data to SQLite.
8. React reloads the server state so the saved data appears on screen.

That flow is the bridge from Week 2 to Week 3 to Week 4: component state becomes an HTTP request, the API applies rules, and the database preserves the result.

---

## Validation as Layered Defense

Validation belongs in more than one place because each layer protects a different concern.

| Layer | Purpose | Example |
| --- | --- | --- |
| Client validation | User experience | Show immediate feedback before submit |
| API validation | Security and contract enforcement | Reject missing or invalid JSON fields |
| Application rules | Domain correctness | Prevent impossible workflow transitions |
| Database constraints | Last line of integrity | Enforce required, unique, and related data |

Client-side validation is helpful but never sufficient. Anything running in the browser can be bypassed. Server-side validation is the real contract. Database constraints protect the system even if application code has a bug.

When reviewing AI output, students should check whether invalid data can reach the database. If yes, the generated solution is incomplete.

---

## Client State Versus Server State

React state and database state are not the same thing.

React state is ideal for current interaction:

- Form drafts.
- Selected project.
- Expanded panels.
- Loading and error messages.
- Optimistic UI updates.

Server state is data fetched from the API:

- Projects.
- Features.
- Orders.
- Users.
- Saved design decisions.

Server state has a source of truth outside React. It can become stale. Another user, request, or background job might change it. The frontend must be designed around fetching, refreshing, error handling, and reconciliation.

This is one reason state management gets harder as applications become real. The question is not only "where do I store this variable?" It is also "who owns the truth?"

---

## Caching and Freshness

Caching improves speed by reusing previous work, but it introduces a design question: how fresh does the data need to be?

Common cache locations:

- Browser HTTP cache for static assets and safe repeated responses.
- Client memory for recently fetched API data.
- Server memory for expensive summaries or rarely changing reference data.
- Shared cache systems such as Redis in production architectures.

Useful design questions:

- Is the data public or user-specific?
- Can stale data cause harm, or is it merely inconvenient?
- What event should invalidate the cache?
- Should the client show cached data while refreshing in the background?

Caching is not just a performance feature. It is a correctness tradeoff.

---

## Performance Thinking Without Getting Lost in Syntax

Students do not need to become database performance experts in Week 4, but they should recognize the patterns that make apps slow.

The most important concept is round trips. A query inside a loop usually means the app is asking the database many small questions instead of one better-shaped question. This is often called an N+1 query problem.

Other performance design questions:

- Does the endpoint return every record when the UI only needs one page?
- Does the app fetch related data intentionally or accidentally one record at a time?
- Are commonly filtered or sorted fields indexed?
- Does the API return fields the UI does not need?
- Could a summary be precomputed or cached?

The goal is not premature optimization. The goal is to notice when the architecture will stop scaling.

---

## AI-Assisted Data Design Workflow

AI is useful for generating schemas, seed data, endpoint drafts, and validation code. It is less reliable at choosing the right domain boundaries and constraints unless the prompt gives strong guidance.

A stronger workflow:

1. Describe the domain in plain English.
2. Identify entities, relationships, and lifecycle states before asking for code.
3. Ask AI for a proposed schema and explain its reasoning.
4. Review the schema against constraints, relationships, indexes, and data ownership.
5. Ask AI to generate implementation only after the design is clear.
6. Run the app from a fresh database and test realistic invalid inputs.
7. Document what AI produced, what you accepted, and what you changed.

Example prompts for students:

> I am building a course project planner with projects, features, and design decisions. Before writing code, identify the durable entities, relationships, constraints, and likely API resources. Explain your assumptions.

> Review this EF Core entity model as an architect. Look for missing constraints, weak relationships, unclear ownership, bad data types, missing indexes, and places where the model does not match the domain.

> Generate seed data that demonstrates realistic relationships and edge cases. Include enough records to test filtering, empty states, and status changes.

> Review these API endpoints for REST design, validation, error handling, N+1 query risk, and whether the frontend is coupled too tightly to database structure.

---

## Runnable Class Example

Use the sample in `week04/samples/full-stack-architecture-demo` as the in-class demonstration.

The demo is intentionally small, but it combines the concepts from Weeks 1-4:

- HTML, CSS, and JavaScript as the browser foundation.
- React components, controlled forms, reducer-based UI state, and derived display state.
- React-to-API communication with Axios, loading, error, refresh, and mutation flows.
- ASP.NET Core REST endpoints, HTTP methods, status codes, JSON responses, and CORS.
- EF Core model design, SQLite persistence, relationships, seed data, validation, and simple server-side caching.

Suggested classroom flow:

1. Start by reading the README and the architecture diagram.
2. Ask students to identify which state is UI state and which state is durable state.
3. Inspect the EF Core entity classes and `DbContext` as design artifacts before running the app.
4. Trace the first page load from React to Axios to ASP.NET Core to EF Core to SQLite and back.
5. Add a feature from the React UI and identify when local form state becomes durable state.
6. Refresh the browser and show that the feature persists.
7. Send an invalid request and inspect the API error.
8. Ask AI to propose one schema or API-contract improvement, then evaluate the suggestion as a class.

The goal is not to teach every line of implementation. The goal is for students to see how the layers cooperate and where architectural judgment is required.

---

## Discussion Questions

- What data in your current homework app is temporary, and what data should become durable?
- If two users are using the app at the same time, what assumptions break?
- Which database constraints would protect your app from invalid AI-generated endpoint code?
- Which parts of the app should the frontend own, and which parts should the backend own?
- What changes when a React component gets data from an API instead of a local array?
- What would make an AI-generated schema look correct but fail in production?
- How would you explain the difference between API design and database design to a nontechnical stakeholder?

---

## Architecture Review Checklist

Before accepting AI-generated persistence code, students should review:

- The domain nouns are represented as clear entities.
- Relationships match the real-world ownership rules.
- Required fields, unique fields, and constrained status values are explicit.
- Many-to-many relationships are modeled structurally, not as comma-separated text.
- Money, dates, IDs, and status fields use appropriate data types.
- The API exposes useful resources rather than leaking table structure.
- Client validation improves UX, but server validation enforces the contract.
- Database constraints provide a final integrity layer.
- List endpoints have a plan for pagination or filtering.
- Related data is fetched intentionally, avoiding N+1 query patterns.
- Cache behavior is understandable and invalidated after writes.
- Seed data proves the relationships and edge cases actually work.

---

## Key Terms

| Term | Meaning |
| --- | --- |
| Durable state | Data that survives page refreshes, server restarts, and future sessions |
| UI state | Temporary client-side state used to render the current interaction |
| Server state | Data fetched from an API whose source of truth is outside the frontend |
| Entity | A durable thing the system tracks, such as project, user, order, or feature |
| Relationship | A structured connection between entities |
| Constraint | A rule enforced by the database or application |
| Migration | A versioned change to the database schema |
| Seed data | Sample data used to make a fresh database useful for development and testing |
| ORM | A tool that maps application objects to database records |
| N+1 query | A performance problem caused by querying related data inside a loop |
| Transaction | A group of database operations that succeeds or fails as one unit |
| Cache invalidation | The decision about when stored cached data must be refreshed or removed |
