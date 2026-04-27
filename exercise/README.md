# Week 4 In-Class Exercise: Prisma + Express E-Commerce API

**CSC 436 · Web Applications · DePaul University**

---

## Overview

In this exercise, you'll build the backend for an e-commerce API using **Express** and **Prisma** with **SQLite**. You'll use AI tools (GitHub Copilot, ChatGPT, or Claude) to help generate code — and then critically evaluate what the AI produces.

**Tools:** VS Code, GitHub Copilot, Terminal

---

## Setup

### 1. Navigate to the exercise directory and install dependencies

```bash
cd week04/exercise
npm install
```

### 2. Initialize the database

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 3. Verify it works

```bash
node server.js
# Should print: "Server running on http://localhost:3000"
# Visit http://localhost:3000/api/health — should return { status: "ok" }
```

Press `Ctrl+C` to stop the server when done verifying.

---

## Part 1: Extend the Schema

The starter `prisma/schema.prisma` has basic models for `Product`, `Category`, and `Order`. Your task is to extend it.

### Using AI:

Open GitHub Copilot (or your preferred AI tool) and ask it to extend the schema with:

1. A `User` model with: `id`, `email` (unique), `name`, `password` (hashed), `createdAt`
2. An `OrderItem` model that links `Order` to `Product` with a `quantity` and `unitPrice`
3. Proper relationships:
   - A `User` has many `Order`s
   - An `Order` has many `OrderItem`s
   - Each `OrderItem` references one `Product`
   - A `Category` has many `Product`s (already started)
4. Add `@@index` annotations on foreign key fields
5. Add an `OrderStatus` enum: `PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`

### Evaluate the AI output:

Before applying the schema, review it against this checklist:

- [ ] Are all `@relation` fields correct?
- [ ] Are `createdAt` / `updatedAt` fields present?
- [ ] Is `email` marked `@unique`?
- [ ] Are foreign key indexes defined?
- [ ] Is the money type appropriate (Decimal, not Float)?
- [ ] Do cascade delete rules make sense?

### Apply the migration:

```bash
npx prisma migrate dev --name add_users_and_order_items
```

---

## Part 2: Generate Seed Data

### Using AI:

Ask your AI tool to generate a `prisma/seed.js` file that creates:

- 4 categories (Electronics, Clothing, Books, Home & Garden)
- 10+ products spread across categories with realistic names and prices
- 3 users with fake emails
- 5 orders with 2-4 order items each

### Setup the seed script:

The `package.json` already has the seed configuration. Run:

```bash
npx prisma db seed
```

### Verify with Prisma Studio:

```bash
npx prisma studio
```

Browse through each table and verify:
- Products are linked to categories
- Orders have order items
- Order items reference real products
- No orphaned records

---

## Part 3: Implement CRUD Endpoints

Add the following endpoints to `server.js`. Use AI to help, but review each endpoint for:
- Proper error handling
- Input validation
- Correct Prisma queries (watch for N+1!)

### Required Endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/products` | List all products with category |
| `GET` | `/api/products/:id` | Get single product with category |
| `POST` | `/api/products` | Create a product |
| `PUT` | `/api/products/:id` | Update a product |
| `DELETE` | `/api/products/:id` | Delete a product |
| `GET` | `/api/categories` | List categories with product count |
| `GET` | `/api/orders` | List orders with items and user |
| `POST` | `/api/orders` | Create an order with items |

### Test your endpoints:

Use the VS Code REST Client extension, Postman, or curl:

```bash
# List products
curl http://localhost:3000/api/products

# Create a product
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Product", "price": 29.99, "categoryId": 1}'

# Get single product
curl http://localhost:3000/api/products/1
```

---

## Part 4: Find & Fix Performance Issues

Open `slow-queries.js` and analyze the code. This file contains several intentionally inefficient database patterns.

### Your task:

1. Read each function in `slow-queries.js`
2. Identify the performance problem in each
3. Write the corrected version
4. Explain **why** the original was slow and **what** makes the fix better

### Hint: Look for:
- N+1 query patterns (queries inside loops)
- Missing `include` / eager loading
- Multiple queries that could be combined
- Unnecessary data fetching

---

## Submission

No formal submission for the in-class exercise. However:

1. Ensure your schema compiles: `npx prisma validate`
2. Ensure your server starts: `node server.js`
3. Keep your code — you'll extend it for Homework 4
4. **Document** any interesting AI interactions in your prompt log

---

## Bonus Challenges

If you finish early:

1. **Pagination:** Add `?page=1&limit=10` query params to `GET /api/products`
2. **Search:** Add `?search=laptop` to filter products by name
3. **Sorting:** Add `?sort=price&order=desc` to sort results
4. **Validation:** Add Zod validation to the POST endpoints
