import bcrypt from "bcryptjs";
import express from "express";
import request from "supertest";
import healthRouter from "../src/routes/health.routes";
import { cleanDb, prisma } from "./setup";

//We run tests in sequence to avoid DB race conditions
beforeAll(async () => {
  await cleanDb();
});

afterAll(async () => {
  await cleanDb();
  await prisma.$disconnect();
});

//#This is being done to create a test app without starting actual server
const app = express();
app.use("/api", healthRouter);

describe("Health API", () => {
  it("should return 200 and db connected when prisma works", async () => {
    const res = await request(app).get("/api/health");

    //We are checking if API responds correctly
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status", "ok");
    expect(res.body).toHaveProperty("db", "connected");
  });
});

//tests for signup and login
describe("Auth - Signup and Login", () => {
  it("should sign up a new user successfully", async () => {
    const res = await request(app).post("/auth/signup").send({
      email: "testuser@example.com",
      password: "password123",
      role: "user",
    });

    expect(res.status).toBe(201);
    expect(res.body.user).toHaveProperty("id");
    expect(res.body.user.role).toBe("user");
  });

  it("should not allow admin role at signup", async () => {
    const res = await request(app).post("/auth/signup").send({
      email: "admin@example.com",
      password: "password123",
      role: "admin",
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("BAD_REQUEST");
  });

  it("should reject duplicate email signup", async () => {
    const res = await request(app).post("/auth/signup").send({
      email: "testuser@example.com",
      password: "password123",
      role: "user",
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("EMAIL_TAKEN");
  });

  it("should login and return a JWT token", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "testuser@example.com",
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user).toHaveProperty("id");
    expect(res.body.user.role).toBe("user");
  });

  it("should reject login with wrong password", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "testuser@example.com",
      password: "wrongpassword",
    });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
  });
});

// TEST 2: Host can create and publish their experience describe("Host - Create and Publish Experience", () => {
describe("Host - Create and Publish Experience", () => {
  let hostToken: string;
  let experienceId: string;

  beforeAll(async () => {
    //Create a host user directly in DB for test setup speed
    const hash = await bcrypt.hash("hostpass123", 12);
    await prisma.user.create({
      data: { email: "host@example.com", password_hash: hash, role: "host" },
    });

    const loginRes = await request(app).post("/auth/login").send({
      email: "host@example.com",
      password: "hostpass123",
    });
    hostToken = loginRes.body.token;
  });

  it("should allow host to create an experience", async () => {
    const res = await request(app)
      .post("/experiences")
      .set("Authorization", `Bearer ${hostToken}`)
      .send({
        title: "Surfing in Goa",
        description: "Learn surfing basics in beautiful Goa",
        location: "Goa",
        price: 2500,
        start_time: new Date(Date.now() + 86400000).toISOString(),
      });

    expect(res.status).toBe(201);
    expect(res.body.experience.status).toBe("draft");
    experienceId = res.body.experience.id;
  });

  it("should allow host to publish their own experience", async () => {
    const res = await request(app)
      .patch(`/experiences/${experienceId}/publish`)
      .set("Authorization", `Bearer ${hostToken}`);

    expect(res.status).toBe(200);
    expect(res.body.experience.status).toBe("published");
  });

  it("should not allow a regular user to create an experience", async () => {
    const loginRes = await request(app).post("/auth/login").send({
      email: "testuser@example.com",
      password: "password123",
    });
    const userToken = loginRes.body.token;

    const res = await request(app)
      .post("/experiences")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        title: "Fake experience",
        description: "Should fail",
        location: "Nowhere",
        price: 100,
        start_time: new Date(Date.now() + 86400000).toISOString(),
      });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });
});
