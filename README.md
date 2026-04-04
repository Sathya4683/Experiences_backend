
## Database Schema (Logical Overview)

The database is modeled using Prisma ORM with PostgreSQL, capturing users, experiences, and bookings along with role-based access control.

### **User**
| Field           | Type      | Notes                         |
|----------------|----------|-------------------------------|
| id             | UUID     | Primary Key                   |
| email          | String   | Unique                        |
| password_hash  | String   | Hashed password               |
| role           | Enum     | user \| host \| admin         |
| created_at     | DateTime | Default: now()                |

---

### **Experience**
| Field        | Type      | Notes                                      |
|--------------|----------|--------------------------------------------|
| id           | UUID     | Primary Key                                |
| title        | String   |                                            |
| description  | String   |                                            |
| location     | String   | Used for filtering                         |
| price        | Int      |                                            |
| start_time   | DateTime | Used for sorting/filtering                 |
| status       | Enum     | draft \| published \| blocked              |
| created_by   | UUID     | FK → User.id                               |
| created_at   | DateTime | Default: now()                             |

---

### **Booking**
| Field          | Type      | Notes                                      |
|----------------|----------|--------------------------------------------|
| id             | UUID     | Primary Key                                |
| experience_id  | UUID     | FK → Experience.id                         |
| user_id        | UUID     | FK → User.id                               |
| seats          | Int      | Must be ≥ 1                                |
| status         | Enum     | confirmed \| cancelled                     |
| created_at     | DateTime | Default: now()                             |

---

### **Indexes**

- `@@index([location, start_time])`  
- `@@index([user_id, experience_id])`

---

## Project Structure

```

Experiences_backend
├── src
│   ├── app.ts
│   ├── index.ts
│   ├── routes
│   │   ├── auth.routes.ts
│   │   ├── experience.routes.ts
│   │   └── health.routes.ts
│   ├── controllers
│   │   ├── auth.controller.ts
│   │   ├── experience.controller.ts
│   │   └── booking.controller.ts
│   ├── services
│   │   ├── auth.service.ts
│   │   ├── experience.service.ts
│   │   └── booking.service.ts
│   ├── middlewares
│   │   ├── auth.middleware.ts
│   │   ├── validate.middleware.ts
│   │   └── logger.middleware.ts
│   ├── validators
│   │   ├── auth.validator.ts
│   │   ├── experience.validator.ts
│   │   └── booking.validator.ts
│   ├── db
│   │   └── prisma.ts
│   └── utils
│       ├── errors.ts
│       └── jwt.ts
├── prisma
│   └── schema.prisma
├── tests
│   ├── setup.ts
│   └── api.test.ts
├── docker-compose.yaml
├── .env.example
├── .env.test
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md

```

---

The above structure aligns with the database schema, enabling a clear flow from routes → controllers → services → database, while keeping validation and middleware concerns modular and maintainable.
