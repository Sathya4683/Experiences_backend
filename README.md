# Experiences Marketplace — Backend API

REST API for an "Experiences" marketplace with authentication and role-based access control.

Stack: Node.js + Express + TypeScript + Prisma + PostgreSQL + Docker

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

> If you are running the Node server locally (not via Docker), change the host in `DATABASE_URL` from `postgres` to `localhost`.

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

Replace `TOKEN` with the JWT from the login response.
Replace `EXPERIENCE_ID` with an ID from the seed output or a create response.

---

### Signup

```bash
# Sign up as a user
curl -s -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"password123","role":"user"}' | jq

# Sign up as a host
curl -s -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"bob@example.com","password":"password123","role":"host"}' | jq
```

---

### Login

```bash
# Login as admin (from seed)
curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@yoliday.com","password":"Admin@1234"}' | jq

# Login as host (from seed)
curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"priya.sharma@host.com","password":"Host@1234"}' | jq

# Login as user (from seed)
curl -s -X POST http://localhost:3000/auth/login \
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
```

New experiences always start as `draft`.

---

### Publish Experience (owner host or admin)

```bash
curl -s -X PATCH http://localhost:3000/experiences/EXPERIENCE_ID/publish \
  -H "Authorization: Bearer TOKEN" | jq
```

---

### Block Experience (admin only)

```bash
curl -s -X PATCH http://localhost:3000/experiences/EXPERIENCE_ID/block \
  -H "Authorization: Bearer ADMIN_TOKEN" | jq
```

---

### List Published Experiences (public, no auth needed)

```bash
# All published experiences
curl -s "http://localhost:3000/experiences" | jq

# Filter by location
curl -s "http://localhost:3000/experiences?location=Goa" | jq

# Filter by date range
curl -s "http://localhost:3000/experiences?from=2025-09-01T00:00:00.000Z&to=2025-12-31T00:00:00.000Z" | jq

# Pagination and sort
curl -s "http://localhost:3000/experiences?page=1&limit=5&sort=desc" | jq
```

Supported query parameters: `location`, `from`, `to`, `page`, `limit`, `sort` (asc | desc).

---

### Book an Experience (user or admin only)

```bash
curl -s -X POST http://localhost:3000/experiences/EXPERIENCE_ID/book \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"seats": 2}' | jq
```

---

### Health Check

```bash
curl -s http://localhost:3000/health | jq
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
