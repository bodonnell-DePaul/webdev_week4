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

## ORMs, Prisma, and the Role of a Schema

An ORM is a boundary between application code and the database. It lets developers work with language-level objects while still relying on a database underneath.

Prisma is useful in this course because its schema file becomes a readable design artifact. Students and AI tools can inspect it and discuss the system at a higher level than raw SQL strings.

The Prisma schema communicates:

- The main entities in the domain.
- Fields and data types.
- Required versus optional data.
- Relationships between records.
- Unique constraints and indexes.
- How the application expects the database to evolve.

Students do not need to memorize every Prisma syntax detail. They do need to understand what a generated schema means and whether it matches the domain.

### Migrations as Versioned Architecture

A migration is a versioned change to the database structure. It is similar to a commit in source control: it describes how the system moves from one shape to another.

Important migration habits:

- Treat migrations as history, not scratch paper.
- Do not edit migrations that have already been shared or applied elsewhere.
- Give migrations meaningful names that describe the design change.
- Keep seed data separate from schema changes.
- Test the application from a fresh database, not only from a database that already happens to work on your machine.

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

> Review this Prisma schema as an architect. Look for missing constraints, weak relationships, unclear ownership, bad data types, missing indexes, and places where the model does not match the domain.

> Generate seed data that demonstrates realistic relationships and edge cases. Include enough records to test filtering, empty states, and status changes.

> Review these API endpoints for REST design, validation, error handling, N+1 query risk, and whether the frontend is coupled too tightly to database structure.

---

## Runnable Class Example

Use the sample in `week04/samples/full-stack-architecture-demo` as the in-class demonstration.

The demo is intentionally small, but it combines the concepts from Weeks 1-4:

- HTML, CSS, and JavaScript as the browser foundation.
- React components, controlled forms, reducer-based UI state, and derived display state.
- REST endpoints, HTTP methods, status codes, JSON responses, and CORS.
- Prisma schema design, SQLite persistence, relationships, seed data, validation, and simple server-side caching.

Suggested classroom flow:

1. Start by reading the README and the architecture diagram.
2. Ask students to identify which state is UI state and which state is durable state.
3. Inspect the Prisma schema as a design artifact before running the app.
4. Run the app and add a feature from the React UI.
5. Refresh the browser and show that the feature persists.
6. Send an invalid request and inspect the API error.
7. Ask AI to propose one schema improvement, then evaluate the suggestion as a class.

The goal is not to teach every line of implementation. The goal is for students to see how the layers cooperate and where architectural judgment is required.

---

## Discussion Questions

- What data in your current homework app is temporary, and what data should become durable?
- If two users are using the app at the same time, what assumptions break?
- Which database constraints would protect your app from invalid AI-generated endpoint code?
- Which parts of the app should the frontend own, and which parts should the backend own?
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
