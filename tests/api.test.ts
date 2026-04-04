import express from "express";
import request from "supertest";
import healthRouter from "../src/routes/health.routes";

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
