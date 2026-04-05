# Experiences Marketplace — Backend API

REST API for an "Experiences" marketplace with authentication and role-based access control.

Stack: Node.js + Express + TypeScript + Prisma + PostgreSQL + Docker

---

## Live Deployment

|                  | URL                                      |
| ---------------- | ---------------------------------------- |
| **API (Render)** | https://experiences-backend.onrender.com |
| **Database**     | PostgreSQL hosted on Neon                |

Health check:

```bash
curl -s https://experiences-backend.onrender.com/health | jq
```

> Render free tier spins down after inactivity. The first request may take 30-60 seconds to respond. Subsequent requests are fast.

---

## Table of Contents

1. [Setup Instructions](#setup-instructions)
2. [Running Locally (dev mode)](#running-locally-dev-mode-with-hot-reload)
3. [DB Setup — Schema and Migrations](#db-setup--schema-and-migrations)
4. [How to Run](#how-to-run)
5. [curl Examples](#curl-examples)
6. [RBAC Rules Implemented](#rbac-rules-implemented)

---

## Setup Instructions

### 1. Clone or extract the project

```bash
cd experiences-backend
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` with the following values:

```env
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/experiences_db"
JWT_SECRET="your-secret-key-change-this"

POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=experiences_db
```

> If running the Node server locally (not via Docker), change the host in `DATABASE_URL` from `postgres` to `localhost`.

### 3. Start the application

```bash
docker-compose up --build
```

This starts the PostgreSQL database and the Node API together. Migrations run automatically on startup via `start.sh`. The API is available at `http://localhost:3000`.

To run in the background:

```bash
docker-compose up --build -d
```

To stop:

```bash
docker-compose down
```

---

## Running Locally (dev mode with hot reload)

If you want to run the Node server directly on your machine with the DB in Docker:

```bash
# Start only the database
docker-compose up postgres -d

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Start dev server
npm run dev
```

Change `DATABASE_URL` in `.env` to use `localhost` instead of `postgres` when running this way.

---

## DB Setup — Schema and Migrations

### Tables

**users** — `id`, `email` (unique), `password_hash`, `role` (admin | host | user), `created_at`

**experiences** — `id`, `title`, `description`, `location`, `price` (int), `start_time`, `created_by` (FK → users.id), `status` (draft | published | blocked), `created_at`

**bookings** — `id`, `experience_id` (FK), `user_id` (FK), `seats` (int, min 1), `status` (confirmed | cancelled), `created_at`

### Running migrations manually

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### Seeding the database

The seed script creates realistic test data across all tables including an admin account (which cannot self-register via the API).

```bash
npm run seed
```

What gets created:

| Role  | Email                 | Password   |
| ----- | --------------------- | ---------- |
| admin | admin@yoliday.com     | Admin@1234 |
| host  | priya.sharma@host.com | Host@1234  |
| host  | arjun.mehta@host.com  | Host@1234  |
| host  | sara.dsouza@host.com  | Host@1234  |
| user  | rahul.nair@user.com   | User@1234  |
| user  | meera.pillai@user.com | User@1234  |
| user  | dev.patel@user.com    | User@1234  |

Also creates 8 experiences (6 published, 1 draft, 1 blocked) and 7 bookings. The seed output prints all UUIDs to the terminal so you can use them immediately in curl commands.

### DB indexes explained

| Index                             | Columns                    | Why                                                                                                                                                               |
| --------------------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `experiences_location_start_time` | `location`, `start_time`   | `GET /experiences` filters by location and sorts/range-filters by start_time. Without this index Postgres does a full table scan on every public listing request. |
| `bookings_user_id_experience_id`  | `user_id`, `experience_id` | Every booking attempt runs a duplicate-check query on both columns. This index makes it a fast lookup instead of a full scan.                                     |

---

## How to Run

```bash
# Full Docker setup (recommended)
docker-compose up --build

# Dev mode (local Node + Docker DB)
npm run dev

# Run tests (DB must be running)
npm run test

# Seed the database
npm run seed
```

---

## curl Examples

Two base URLs are shown throughout:

- **Local**: `http://localhost:3000`
- **Hosted**: `https://experiences-backend.onrender.com`

Replace `TOKEN` with the JWT from the login response.
Replace `EXPERIENCE_ID` with an ID from the seed output or a create response.

---

### Signup

```bash
# Local
curl -s -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"password123","role":"user"}' | jq

# Hosted
curl -s -X POST https://experiences-backend.onrender.com/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"password123","role":"user"}' | jq
```

To sign up as a host, change `"role":"user"` to `"role":"host"`. Admin role is not accepted at signup.

---

### Login

```bash
# Local — login as admin
curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@yoliday.com","password":"Admin@1234"}' | jq

# Hosted — login as admin
curl -s -X POST https://experiences-backend.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@yoliday.com","password":"Admin@1234"}' | jq

# Local — login as host
curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"priya.sharma@host.com","password":"Host@1234"}' | jq

# Hosted — login as host
curl -s -X POST https://experiences-backend.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"priya.sharma@host.com","password":"Host@1234"}' | jq

# Local — login as user
curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rahul.nair@user.com","password":"User@1234"}' | jq

# Hosted — login as user
curl -s -X POST https://experiences-backend.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rahul.nair@user.com","password":"User@1234"}' | jq
```

Response:

```json
{
  "token": "eyJhbGci...",
  "user": { "id": "uuid", "role": "host" }
}
```

---

### Create Experience (host or admin only)

```bash
# Local
curl -s -X POST http://localhost:3000/experiences \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Sunrise Kayaking in Alleppey",
    "description": "A 3-hour guided kayak through the backwaters at sunrise.",
    "location": "Alleppey, Kerala",
    "price": 2200,
    "start_time": "2025-10-01T04:30:00.000Z"
  }' | jq

# Hosted
curl -s -X POST https://experiences-backend.onrender.com/experiences \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Sunrise Kayaking in Alleppey",
    "description": "A 3-hour guided kayak through the backwaters at sunrise.",
    "location": "Alleppey, Kerala",
    "price": 2200,
    "start_time": "2025-10-01T04:30:00.000Z"
  }' | jq
```

New experiences always start as `draft`.

---

### Publish Experience (owner host or admin)

```bash
# Local
curl -s -X PATCH http://localhost:3000/experiences/EXPERIENCE_ID/publish \
  -H "Authorization: Bearer TOKEN" | jq

# Hosted
curl -s -X PATCH https://experiences-backend.onrender.com/experiences/EXPERIENCE_ID/publish \
  -H "Authorization: Bearer TOKEN" | jq
```

---

### Block Experience (admin only)

```bash
# Local
curl -s -X PATCH http://localhost:3000/experiences/EXPERIENCE_ID/block \
  -H "Authorization: Bearer ADMIN_TOKEN" | jq

# Hosted
curl -s -X PATCH https://experiences-backend.onrender.com/experiences/EXPERIENCE_ID/block \
  -H "Authorization: Bearer ADMIN_TOKEN" | jq
```

---

### List Published Experiences (public, no auth needed)

```bash
# Local — all published
curl -s "http://localhost:3000/experiences" | jq

# Hosted — all published
curl -s "https://experiences-backend.onrender.com/experiences" | jq

# Local — filter by location
curl -s "http://localhost:3000/experiences?location=Goa" | jq

# Hosted — filter by location
curl -s "https://experiences-backend.onrender.com/experiences?location=Goa" | jq

# Local — date range + pagination + sort
curl -s "http://localhost:3000/experiences?from=2025-09-01T00:00:00.000Z&to=2025-12-31T00:00:00.000Z&page=1&limit=5&sort=desc" | jq

# Hosted — date range + pagination + sort
curl -s "https://experiences-backend.onrender.com/experiences?from=2025-09-01T00:00:00.000Z&to=2025-12-31T00:00:00.000Z&page=1&limit=5&sort=desc" | jq
```

Supported query parameters: `location`, `from`, `to`, `page`, `limit`, `sort` (asc | desc).

---

### Book an Experience (user or admin only)

```bash
# Local
curl -s -X POST http://localhost:3000/experiences/EXPERIENCE_ID/book \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"seats": 2}' | jq

# Hosted
curl -s -X POST https://experiences-backend.onrender.com/experiences/EXPERIENCE_ID/book \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"seats": 2}' | jq
```

---

### Health Check

```bash
# Local
curl -s http://localhost:3000/health | jq

# Hosted
curl -s https://experiences-backend.onrender.com/health | jq
```

---

### Error Response Shape

All errors across the API follow this format:

```json
{
  "error": {
    "code": "SOME_CODE",
    "message": "Human-readable description",
    "details": []
  }
}
```

---

## RBAC Rules Implemented

- `POST /auth/signup` only accepts `user` or `host` as role. Attempting to register as `admin` returns 400. Admin accounts must be created via the seed script or directly in the database.
- `POST /experiences` is restricted to `host` and `admin`. A `user` attempting this gets 403.
- All newly created experiences default to `draft` status regardless of who creates them.
- `PATCH /experiences/:id/publish` can only be called by the host who created the experience, or by an admin. A different host trying to publish another host's experience gets 403.
- `PATCH /experiences/:id/block` is restricted to `admin` only. Any other role gets 403.
- `POST /experiences/:id/book` is restricted to `user` and `admin`. Hosts cannot book any experience.
- A host cannot book their own experience even if their role were permitted — ownership is checked separately and returns 403.
- Booking is only allowed on `published` experiences. Attempting to book a `draft` or `blocked` experience returns 400.
- A user cannot make a second `confirmed` booking for the same experience. Duplicate attempts return 400.
- All protected routes require `Authorization: Bearer <token>`. Missing or invalid tokens return 401.
