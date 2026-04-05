import express from "express";
import { requestLogger } from "./middlewares/logger.middleware";
import authRoutes from "./routes/auth.routes";
import experienceRoutes from "./routes/experience.routes";
import healthRoutes from "./routes/health.routes";
import { sendError } from "./utils/errors";

const app = express();

//Parse JSON bodies
app.use(express.json());

//Log every request with method, path, status, latency
app.use(requestLogger);

//Mount all routes
app.use("/", healthRoutes);
app.use("/auth", authRoutes);
app.use("/experiences", experienceRoutes);

//Catch-all for unknown routes
app.use((_req, res) => {
  return sendError(res, 404, "NOT_FOUND", "Route not found");
});

export default app;
