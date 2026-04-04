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
